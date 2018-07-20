const db = require('./modulos/db');;
const sqlstring = require('sqlstring');


module.exports.indentificarJSON = function(json, funcion_retorno,client){
	return new Promise((respuesta, rechazo) => {
		console.log("-----------PASO 1----IDENTIFICANDO JSON")
		var id_page = "ID de pagina";
		var mid = "ID de mensaje";
		var text = "Texto del mensaje";
		var saliente = "false";
		var attachments = false;
		var attachments_type = "Image / Video";
		var attachments_payload_url = "URl";
		var psid_webhook_usuario = "PSID user";
		var json_final={};
		var id_msj_insertado;
		var data_log = {detalle : 'Init',
							estado: 0};
		var persona = {};

		if (json.hasOwnProperty('object') && json.object == 'page')
		{
			funcion_retorno({"Objeto": "page"},'ignorar')
			//si es un objeto de pagina
			//Si existe la propiedad entry
			if (json.hasOwnProperty('entry'))//##INICIO SI ENTRY --
			{
				json_final.id_page=json.entry[0].id;
				json_final.time=json.entry[0].time;
				db.consultar_page(json_final.id_page, funcion_retorno, client)
				.then(page_ok=>{
					if(page_ok){
						//recorro el array Entry[index] como entry 
						//La funcion forEach() me retorna el primer parametro el elemeno actual del array, indice del elemnto, array
						json.entry.forEach(function(entry, index, array_entry){
							
						if(entry.hasOwnProperty('messaging'))
						{//##INICIO SI MESSAGING -- Si el objeto tiene la propiedad messaging 
							//recorro el array messaging[index] como messaging 
							entry.messaging.forEach(function(messaging, i , array_messaging){
								
				                json_final.timestamp = messaging.timestamp;
								switch(true){
									case messaging.hasOwnProperty('delivery'):
									
										//Si existe el atributo delivery quiere decir que es un informe de entrega
										console.log("-----PASO 1.1 JSON IDENTIFICADO COMO INFORME DE ENTREGA");
										/*j.watermark = watermark si existe || sino = 0;
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
							                        		respuesta(mids_ok);
							                        	}
												})
												.catch(mids_error=>{
													console.log("Error middds")
													rechazo(mids_error)
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
							                        		respuesta(mids_ok);
												})
												.catch(mids_error=>{
													console.log("Error middds",mids_error)
													Reject(mids_error)
												})
														
										}
										
									break;
									case messaging.hasOwnProperty('message'):
										db.cargarLOG(json, client,'insert',data_log)
										.then(log_ok =>{data_log.id_log = log_ok;console.log("Log insertado", log_ok)})
									 	.catch(log_nook=>{console.log("Log no insertado", log_nook)})
										json_final.mid = messaging.message.mid;
										if(messaging.message.hasOwnProperty('text')){
											json_final.text = messaging.message.text;
										}else{
											json_final.text = "'adjunto'";
										}
										if(messaging.message.hasOwnProperty('attachments')){attachments=true;}
										//si dentro de message existe la propiedad 'is_echo' quiere decir que es un mensaje saliente
										if(messaging.message.hasOwnProperty('is_echo'))
										{	
											json_final.psid_webhook_usuario = messaging.recipient.id;
											json_final.saliente = 'true';
											console.log("------PASO 1.1 JSON IDENTIFICADO COMO MENSAJE SALIENTE PSID",json_final.psid_webhook_usuario)
										}else{
											//funcion_retorno({"mensaje": "entrante"}, 'ignorar');
											//es un mensaje saliente 
											//Si es saliente entoncess el que recibe es el usuario
											json_final.psid_webhook_usuario = messaging.sender.id;
											json_final.saliente = 'false';
											console.log("-----PASO 1.1 JSON IDENTIFICADO COMO MENSAJE ENTRANTE PSID",json_final.psid_webhook_usuario)
										}

										db.consultar_usuario(json_final.psid_webhook_usuario,funcion_retorno,client)
										.then(user_exist => {
											//Verificamos si el usuario existe en la BD de chat-facebook
											return new Promise((res, rej)=>{
												if(user_exist){
													json_final.id_usuario = user_exist.id;
													persona.id_usuario=user_exist.id;
													res(user_exist.persona);
												}else{
													//Si no existe se inserta
													console.log("Si usuario no existe entonces lo insertamos:")
													db.insertarUSER(json_final,funcion_retorno,client)
													.then(currval_user => {
														console.log('Me traigo el currval: ', currval_user);
														json_final.id_usuario=currval_user.currval;
														persona.id_usuario=currval_user.currval;
														res(0);
													})
													.catch(error => {
														console.log('error insertando user', error);
														rej(error);
													})
												}
											})
										})
										.then(cod_persona=>{
											return new Promise((res, rej)=>{
												
												if(json_final.saliente == 'false'){
													if(cod_persona!=0){
													//EXiste en tb_persona
													console.log("El usuario existe en tb_persona")
													//SI existe en tb_persona no se parsea el texto
													res(false)

													}else{
														console.log("El usuario es un NN")
														res(true)
													}
												}else{
													//Si es un mensaje saliente se ignora
													res(false)
												}
												
											})
										})
										.then(buscar_correo=>{
											if(buscar_correo){
												return db.buscarCorreo(json_final.text)
											//Si no encontró un correo le dice a la funcion que sigue que no hay nada
											}else{

												return false;
											}
										})
										.then(alta_cabecera_persona=>{
											//Si captura un true quiere decir que en la funcion anterior
											//se encontro un correo
											if(alta_cabecera_persona){
												persona.mail =alta_cabecera_persona.mail
												persona.nombre =alta_cabecera_persona.nombre
												return db.altaCabeceraPersona(persona, client)											
											}else{
												//sino le dice a la funcion que sigue que no hay nada para hacer
												return false
											}
											
										})
										.then(cod_inscripto=>{
											//Si se obtiene true o algun valor quiere decir que la cabecera fue insertada
											if(cod_inscripto){
												console.log("typeof(cod_inscripto)=='number'")
												persona.cod_inscripto= cod_inscripto
												//Retorno la promesa a la funcion que sigue
												//Esto significa que no se va a insertar el MSJ hasta que no se haya 
												//Insertado el mail y actualizado el USER
												return db.altaMailPersona(persona, client)
											}else{
												console.log("typeof(cod_inscripto)=='false'")
												//Sino quiere decir que sigue el camino del false de las funciones anteriores
												//y continua el proceso normalmente a insertar msj
												return false

											}
										})
										.then(insert_msj => {
											db.insertarMSJ(json_final,funcion_retorno,client)
											.then(insertar_log=>{
												id_msj_insertado = insertar_log;
												data_log.estado=1;
												data_log.detalle ='mensaje insertado';
						                      	return db.cargarLOG(json,client,'update',data_log)
						                      	.then(ok_log => {console.log("UPDATE LOG OK :",ok_log)})
						                      	.catch(error_log => {console.log(error_log)})
							                    console.log("mensaje instertado en la base");
											})
											.then((currval) => {
												
							                    if(attachments){
							                       	console.log('atachments true');
							                       	json_final.id_interaccion = id_msj_insertado; 
							                    	var count_attachs = messaging.message.attachments.length;
													// expected output: 4
													messaging.message.attachments.forEach((attach0, index_attach, array_attach)=>{

							                        json_final.attachments_type = attach0.type
							                        json_final.attachments_payload_url= attach0.payload.url;
							                        db.insertarATTACHMENTS(json_final, funcion_retorno, client)
							                        .then(attach => {
							                        	console.log("atachments "+index_attach+"  Insertado")
							                        	if(index_attach==(count_attachs-1)){
							                        		respuesta(attach);
							                        		console.log("FIN: "+count_attachs+" atachments  Insertados")
							                        	}
							                        })
							                        .catch(no_atach => {
							                        	console.log("Error insertando attachmetns2222222222", no_atach)
							                        	rechazo(no_atach)
							                        })

							                		})
							                        	
							                        }else{
							                        	respuesta(currval);
							                        }

						                    })
						                    .catch((bad)=> {
													console.log("Reject db.insertarJSON")
							                        rechazo(bad)
							                     });
						                    })
							            .catch(user_noexis => {
							            	rechazo(user_noexis)
							            	});
							            if(messaging.message.hasOwnProperty('attachments'))
											{
												messaging.message.attachments.forEach(function(attachments, index, array_atachments){
												attachments_type = attachments.type;
												attachments_payload_url = attachments.payload.url;

											});
										}
									
								
									break;
									case messaging.hasOwnProperty('read'):
										console.log("-----PASO 1.1 JSON IDENTIFICADO COMO INFORME DE LECTURA")
										//Es un informe de lectura de un mensaje entrante o saliente
										json_final.watermark = messaging.read.hasOwnProperty('watermark') ? messaging.read.watermark : 1;
										json_final.psid_webhook_usuario = messaging.sender.id;
										db.informeLECTURA(json_final,client)
										.then(msj=>{
											console.log(msj)
											respuesta(msj)
										}) 
										.catch(err=>{
											console.log(err)
											rechazo(err)
										})	
									break;
									default:
										console.log("entro en default")
										respuesta('No se reconoce el tipo de messaging - ')
								}
								
								
								

						});//##FIN FOREACH MESSAGING --
					
						} //Fin if(entry.hasOwnProperty('messaging'))
					});//fin foreach entry
					}else{
						//CAE AQUI SI LA PAGINA NO EXISTE EN LA BD
						funcion_retorno({"PAGE":" No existe"},'abortar');
						rechazo({"PAGE":" no existe ne db"},'abortar');
					}

					
				})//Cierre promesa consultar_page()
				.catch(page_error => {
					console.log(page_error		)
					//CAE AQUI SI LA PAGINA NO EXISTE EN LA BD
					funcion_retorno({"PAGE":" CONSULTAR EXISTENCIA ERROR"},'abortar');
					rechazo({"PAGE":" CONSULTAR EXISTENCIA ERROR"},'abortar');

				})
			
			}else{
				//si no existe la propiedad entry
				funcion_retorno({"Entry":" No existe"},'abortar');
				rechazo({"NO es":" un mensaje"},'abortar');

			}////Cierre if(entry exist)##FIN SI ENTRY --
		}else
		{	
				console.log("-----------PASO 1----ERROR IDENTIFICANDO JSON")
				funcion_retorno({"Objeto":" desconocido"},'abortar');
					rechazo({"NO es":" un mensaje"},'abortar');

		} //Cierre if(object=='page')
			


			
	})//Cierre promesa
			
		
}; //Cierre funcion


