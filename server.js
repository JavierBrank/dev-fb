const db = require('./modulos/db');;
const sqlstring = require('sqlstring');
const request = require("request");


module.exports.indentificarJSON = function(json,client){
	return new Promise((resolve, reject) => {
		console.log("-----------PASO 1----IDENTIFICANDO JSON")
		var json_final={};
		var json_page = {};
		var data_log = {detalle : 'Init',
										estado: 0};
		var persona = {};
		var adjuntos = false;

		if (json.hasOwnProperty('object') && json.object == 'page')
		{
			//si es un objeto de pagina
			//Si existe la propiedad entry
			if (json.hasOwnProperty('entry'))//##INICIO SI ENTRY --
			{
				json_final.id_page=json.entry[0].id;
				json_final.time=json.entry[0].time;
				db.consultarPage(json_final.id_page, client)
				.then(page_ok=>{
					if(page_ok.enabled){
						json_page.id = page_ok.id
						json_page.token = page_ok.token
						//recorro el array Entry[index] como entry 
						//La funcion forEach() me retorna el primer parametro el elemeno actual del array, indice del elemnto, array
						json.entry.forEach(function(entry, index, array_entry){
							
						if(entry.hasOwnProperty('messaging'))
						{//##INICIO SI MESSAGING -- Si el objeto tiene la propiedad messaging 
							//recorro el array messaging[index] como messaging 
							entry.messaging.forEach(function(messaging, i , array_messaging){
								
				                json_final.timestamp = messaging.timestamp;
								switch(true){
									/***********************INFORME DE ENTREGA**********************/
									case messaging.hasOwnProperty('delivery'):
										//Si existe el atributo delivery quiere decir que es un informe de entrega
										console.log("-----PASO 1.1 JSON IDENTIFICADO COMO INFORME DE ENTREGA");
										/*j.watermark = watermark si existe sino = 0;
											luego si existe la propiedad 'mids' dentro de delivery(no siempre sucede segun facebook)
											recorro el array mids en busca de todos los id_mensaje
											los almaceno en un hash junto con el watermark(fecha de entrega en bigint)
											y el contador es para que salga de la promesa una vez que haya recorrido todo el arreglo mids
										*/

										json_final.watermark = messaging.delivery.hasOwnProperty('watermark') ? messaging.delivery.watermark : 0;
										if(messaging.delivery.hasOwnProperty('mids')){
											var count_mids=messaging.delivery.mids.length;
											messaging.delivery.mids.forEach((midn, indexmidn, arraymids)=>{
												//utilizo midn ya que es el elemento actual del array mids[indexmidn]
												json_final.mid=midn
												db.informeEntrega(json_final,client)
												.then(mids_ok=>{
													
													if(indexmidn==(count_mids-1)){
							                        		console.log("FIN: "+count_mids+" Mensaje(s) Actualizado(s)")
							                        		resolve(mids_ok);
							                        	}
												})
												.catch(mids_error=>{
													console.log("Error middds")
													reject(mids_error)
												})
														
											})
										}else{
											//Si el informe de entrega viene sin mids(id_mensaje) se actualizaran todos los mensajes
											/*salientes [que pertenezcan al usuario psid(id_webhook_usuario)] anteriores a 
											la fecha 'watermark' que no se hayan actualizado es decir aquellos  cuyo 
											fecha_time = 1 
											para hacer lo siguiente necesito el PSID_webhook y el timestamp */
											//En el caso de los "Delivery" el sender siempre va a ser PSID del usuario
											json_final.psid_webhook_usuario = messaging.sender.id;
											json_final.midausente = true;
												db.informeEntrega(json_final,client)
												.then(mids_ok=>{
													console.log(mids_ok)
							                        		resolve(mids_ok);
												})
												.catch(mids_error=>{
													console.log("Error middds",mids_error)
													Reject(mids_error)
												})
														
										}
									break;
									/***********************MENSAJE ENTRANTE O SALIENTE**********************/
									case messaging.hasOwnProperty('message'):
										db.guardarLog(json, client,'insert',data_log)
										.then(log_ok =>{data_log.id_log = log_ok;console.log("Log insertado", log_ok)})
									 	.catch(log_nook=>{console.log("Log no insertado", log_nook)})
										json_final.mid = messaging.message.mid;
										if(messaging.message.hasOwnProperty('text')){
											json_final.text = messaging.message.text;
										}else{
											json_final.text = null;
										}
										if(messaging.message.hasOwnProperty('attachments')){adjuntos=true;}
										//si dentro de message existe la propiedad 'is_echo' quiere decir que es un mensaje saliente
										if(messaging.message.hasOwnProperty('is_echo'))
										{	
											json_final.psid_webhook_usuario = messaging.recipient.id;
											json_final.saliente = 'true';
											console.log("------PASO 1.1 JSON IDENTIFICADO COMO MENSAJE SALIENTE PSID",json_final.psid_webhook_usuario)
										}else{
											//es un mensaje saliente 
											//Si es saliente entoncess el que recibe es el usuario
											json_final.psid_webhook_usuario = messaging.sender.id;
											json_final.saliente = 'false';
											console.log("-----PASO 1.1 JSON IDENTIFICADO COMO MENSAJE ENTRANTE PSID",json_final.psid_webhook_usuario)
										}
										db.consultarUsuario(json_final.psid_webhook_usuario, client)
										.then(user_exist => {
											//consultar o insertar user
											return new Promise((res, rej)=>{
												if(user_exist){
													//Si usuario existe ya sea con o sin codigo de persona 
													//le pasamos a la siguiente funcion el objeto user_exist con los atributos
													json_final.id_usuario = user_exist.id;
													persona.id_usuario=user_exist.id;
													res(user_exist);
												}else{
													//Si no existe se inserta
													console.log("Si usuario no existe entonces lo insertamos:")
													db.insertarUsuario(json_final, client)
													.then(currval_user => {
														console.log('Me traigo el currval: ', currval_user);
														json_final.id_usuario=currval_user.currval;
														persona.id_usuario=currval_user.currval;
														persona.cod_persona=0;
														res(0);
													})
													.catch(error => {
														console.log('error insertando user', error);
														rej(error);
													})
												}
											})
										})
										.then(person=>{
											//Verifica si existe en tb_persona
											return new Promise((res, rej)=>{
												if(json_final.saliente == 'false'){
													if(person.cod_persona!=0){
														//EXISTE EN TB_PERSONA
														persona.cod_inscripto=person.cod_persona
														res(false)
													}else{
														//USUARIO NO EXISTE EN TB PERSONA
														res(true)
													}
												}else{
													//Si es un mensaje saliente se ignora y no se parse el texto
													res(false)
												}
												
											})
										})
										.then(buscar_correo=>{
											//Busca mail en el texto si no existe en tb_persona
											if(buscar_correo){
												return db.buscarCorreo(json_final.text)
												//Si no encontró un correo le dice a la funcion que sigue que no hay nada
											}else{
												return false;
											}
										})
										.then(curl_nombre=>{
											//Traer nombre del usuario de facebook con la API GRAPH
											return new Promise((res,rej)=>{
												if(curl_nombre){
													persona.mail =curl_nombre.mail
													persona.nombre =curl_nombre.nombre
													//si CURL_NOMBRE es true quiere decir que el usuario es un NN y se encontró un mail en el parseo
													var url_user = 'https://graph.facebook.com/v3.0/'+json_final.psid_webhook_usuario
													var data_user = {
												 	method: 'GET',
												  	url: url_user,
												  	qs:  {
												    	access_token: json_page.token 
												  		}
													}
													console.log("CURL: ",data_user)
													request(data_user, function (error, response, body) {
															persona.apellido_facebook = ' '
													      	persona.genero = ' '
													  
												  	if (error){
													    console.error("ERORR CURL!!!!!",error);
													    res(true)
													  } else{
													    json = JSON.parse(body)
													    if(json.hasOwnProperty('error')){
													      console.log("Error con CURL:",json); 
													      res(true)  
													    }else{
													      console.log("OKOKOKO: ",json);  
													      console.log(json)
													      persona.nombre_facebook = json.hasOwnProperty('first_name') ? json.first_name : ' '
													      persona.apellido_facebook = json.hasOwnProperty('last_name') ? json.last_name : ' '
													      if(json.hasOwnProperty('gender')){
													      	persona.genero = (json.gender == 'male')	? 'M' : 'F'
													      }
													      persona.foto_perfil = json.hasOwnProperty('profile_pic') ? json.profile_pic : ' ' 
													      res(true)
													    }
													  }  
													});
												}else{
													/*si curl_nombre es false es porque: 
														1. ya existe en tb_persona 
														2. es un msj saliente
														3. No encontró mail en el parseo*/
													res(false)
												}
												
											})
										})
										.then(alta_cabecera_persona=>{
											//Si captura un true quiere decir que en la funcion anterior
											//encontro un correo
											if(alta_cabecera_persona){
												
												return db.altaCabeceraPersona(persona, client)
											}else{
												//sino le dice a la funcion que sigue que no hay nada para hacer
												return false
											}
											
										})
										.then(cod_inscripto=>{
											//Alta mail persona en tb_mail_all
											//Si se obtiene true o algun valor quiere decir que la cabecera fue insertada
											if(cod_inscripto){
												console.log("typeof(cod_inscripto)=='number'")
												persona.cod_inscripto= cod_inscripto
												//Retorno la promesa a la funcion que sigue
												//Esto significa que no se va a insertar el MSJ hasta que no se haya 
												//Insertado el mail y actualizado el USER
												return db.altaMailPersona(persona, client)
											}else{
												//Sino quiere decir que sigue el camino del false de las funciones anteriores
												//y continua el proceso normalmente a insertar msj
												return false

											}
										})
										.then(insert_msj => {
											//Insertar MSJ
											return db.insertarMensaje(json_final,client)
										})
										.then(id_interaccion => {
											//Insertar agjuntos
											if(adjuntos){
												console.log('atachments true');
							          return db.insertarAdjuntos(messaging.message.attachments, client, id_interaccion)
						          }else{
							          return false;
						          }
					          })
					          .then(attach => {
					          	//Terminar Proceso
					          	if(attach){
					          		console.log("Proceso terminado: "+attach+" adjuntos insertados")
					          	}else{
					          		console.log("Proceso terminado")
					          	}
					          	resolve(attach)
							    	})
					        	.catch(error => {
			            		reject(error)
		            		});							
								/***********************INFORME DE LECTURA**********************/
									break;
									case messaging.hasOwnProperty('read'):
										console.log("-----PASO 1.1 JSON IDENTIFICADO COMO INFORME DE LECTURA")
										//Es un informe de lectura de un mensaje entrante o saliente
										json_final.watermark = messaging.read.hasOwnProperty('watermark') ? messaging.read.watermark : 1;
										json_final.psid_webhook_usuario = messaging.sender.id;
										db.informeLectura(json_final,client)
										.then(msj=>{
											console.log(msj)
											resolve(msj)
										}) 
										.catch(err=>{
											console.log(err)
											reject(err)
										})	
									break;
									default:
										console.log("entro en default")
										resolve('No se reconoce el tipo de messaging - ')
								}
								
								
								

						});//##FIN FOREACH MESSAGING --
					
						} //Fin if(entry.hasOwnProperty('messaging'))
					});//fin foreach entry
					}else{
						//CAE AQUI SI LA PAGINA NO EXISTE EN LA BD
						
						reject({"PAGE":"Inhabilitada o inexistente"},'abortar');
					}

					
				})//Cierre promesa consultarPage()
				.catch(page_error => {
					console.log(page_error		)
					//CAE AQUI SI LA PAGINA NO EXISTE EN LA BD
				
					reject({"PAGE":" CONSULTAR EXISTENCIA ERROR"},'abortar');

				})
			
			}else{
				//si no existe la propiedad entry
				
				reject({"NO es":" un mensaje"},'abortar');

			}////Cierre if(entry exist)##FIN SI ENTRY --
		}else
		{	
				console.log("-----------PASO 1----ERROR IDENTIFICANDO JSON")
				
					reject({"NO es":" un mensaje"},'abortar');

		} //Cierre if(object=='page')
			


			
	})//Cierre promesa
			
		
}; //Cierre funcion


