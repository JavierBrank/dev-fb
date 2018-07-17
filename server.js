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
		var data_log = {detalle : 'Init',
							estado: 0};

		if (json.hasOwnProperty('object') && json.object == 'page')
		{
			funcion_retorno({"Objeto": "page"},'ignorar')
			//si es un objeto de pagina
			//Si existe la propiedad entry
			if (json.hasOwnProperty('entry'))
			{
			json_final.id_page=json.entry[0].id;
			json_final.time=json.entry[0].time;
			db.consultar_page(json_final.id_page, funcion_retorno, client)
			.then(page_ok=>{
				if(page_ok){
				//Cargar log y seguir procesando
				db.cargarLOG(json, client,'insert',data_log)
				.then(log_ok =>
				{
				 	console.log("Log insertado ID: ", log_ok);
				 	json_final.id_log = log_ok;
				 	data_log.id_log = log_ok;
			 	})
			 	.catch(log_nook=>{console.log("Log no insertado", log_nook);})
			//recorro el array Entry[index] como entry 
			//La funcion forEach() me retorna el primer parametro el elemeno actual del array, indice del elemnto, array
			json.entry.forEach(function(entry, index, array_entry){
				//Si el objeto tiene la propiedad mmessaging
			if(entry.hasOwnProperty('messaging'))
			{
				//recorro el array messaging[index] como messaging 
				entry.messaging.forEach(function(messaging, i , array_messaging){
					//Si existe el atributo delivery quiere decir que es un informe de entrega
	                json_final.timestamp = messaging.timestamp;
					//json_final.timestamp=messaging.timestamp;
					if(messaging.hasOwnProperty('delivery'))
					{
						funcion_retorno({"mensaje": "informe de entrega"},'ignorar');
						//Es un informe de entrega
					}
					//Si existe el atributo message - pueden ser varias cosas
					if (messaging.hasOwnProperty('message') )
					{
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

	                      	return new Promise((res, rej)=>{
	                      					
	                      	if(user_exist){
	                      			json_final.id_usuario = user_exist.id_usuario;
	                      			res();
	                      			 

	                      	}else{

	                      		console.log("else consultar_uauario")
	                      	db.insertarUSER(json_final,funcion_retorno,client)
	                      	.then(currval_user => {

	                      		console.log('user insertado currval: ', currval_user);

	                      		json_final.id_usuario=currval_user.currval;
	                      		res();
	                      	})
	                      	.catch(error => {
	                      		console.log('error insertando user', error);
	                      		rechazo(error);
	                      	})
	                        //console.log("Catch: User noe xist")
	                        //
	                      	}

	                      	})
	                      	
		                      
              
	                      })
	                      .then(insert_msj => {
	                      			 db.insertarMSJ(json_final,funcion_retorno,client)
		                      	.then((currval) => {
		                      		data_log.estado=1;
		                      		data_log.detalle ='mensaje insertado';
		                      		db.cargarLOG(json,client,'update',data_log)
		                      		.then(ok_log => {console.log("UPDATE LOG OK :",ok_log)})
		                      		.catch(error_log => {console.log(error)})
			                        console.log("mensaje instertado en la base");
			                        if(attachments){
			                        	console.log('atachments true');
			                        	json_final.id_interaccion = currval; 
			                        

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
			                        	
			                        		}
			                        		else{
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
					//si tiene adjuntos
					if(messaging.message.hasOwnProperty('attachments'))
					{	

							messaging.message.attachments.forEach(function(attachments, index, array_atachments){
							attachments_type = attachments.type;
							attachments_payload_url = attachments.payload.url;

						});
					}
							
					
				}
				if (messaging.hasOwnProperty('read'))
				{
					//Es un informe de lectura de un mensaje entrante o saliente

				}
				});
				
			}else
				{
				funcion_retorno({"NO es":" un mensaje"},'abortar');	
				rechazo({"NO es":" un mensaje"},'abortar');
				}

			});
			

				}else{
				//CAE AQUI SI LA PAGINA NO EXISTE EN LA BD
				funcion_retorno({"PAGE":" No existe"},'abortar');
				rechazo({"PAGE":" no existe ne db"},'abortar');
				}

				
			})
			.catch(page_error => {
				//CAE AQUI SI LA PAGINA NO EXISTE EN LA BD
				funcion_retorno({"PAGE":" CONSULTAR EXISTENCIA ERROR"},'abortar');
				rechazo({"PAGE":" CONSULTAR EXISTENCIA ERROR"},'abortar');

			})
			
			}else{
				//si no existe la propiedad entry
				funcion_retorno({"Entry":" No existe"},'abortar');
				rechazo({"NO es":" un mensaje"},'abortar');

			}
			}else
			{	
				console.log("-----------PASO 1----ERROR IDENTIFICANDO JSON")
				funcion_retorno({"Objeto":" desconocido"},'abortar');
					rechazo({"NO es":" un mensaje"},'abortar');

			}
			


			
	})
			
		
};


