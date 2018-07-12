



module.exports.indentificarJSON = function(json, funcion_retorno){


	return new Promise((respuesta, rechazo) => {
		console.log("-----------PASO 1----IDENTIFICANDO JSON")

			var id_page = "ID de pagina";
			var mid = "ID de mensaje";
			var text = "Texto del mensaje";
			var saliente = "false";
			var attachments_type = "Image / Video";
			var attachments_payload_url = "URl";
			var psid_webhook_usuario = "PSID user";
			var json_final={};

			if (json.hasOwnProperty('object') && json.object == 'page')
			{
				//si es un objeto de pagina
				//Si existe la propiedad entry
				if (json.hasOwnProperty('entry')){
					json_final.id_page=json.entry[0].id;
					json_final.time=json.entry[0].time;

					funcion_retorno({"Objeto": "page"},'ignorar')
					 //Cargar log y seguir procesando

					//recorro el array Entry[index] como entry 
					//La funcion forEach() me retorna el primer parametro el elemeno actual del array, indice del elemnto, array
					json.entry.forEach(function(entry, index, array_entry){
						//Si el objeto tiene la propiedad mmessaging
					if(entry.hasOwnProperty('messaging'))
					{
						
						//recorro el array messaging[index] como messaging 
						entry.messaging.forEach(function(messaging, i , array_messaging){
							//Si existe el atributo delivery quiere decir que es un informe de entrega
						

							if(messaging.hasOwnProperty('delivery'))
						{
							funcion_retorno({"mensaje": "informe de entrega"},'ignorar');
							

								//Es un informe de entrega
						}
						//Si existe el atributo message - pueden ser varias cosas
						if (messaging.hasOwnProperty('message') )

						{	

								json_final.mid = messaging.message.mid;
								json_final.text = messaging.message.text;
						//si dentro de message existe la propiedad 'is_echo' quiere decir que es un mensaje saliente
							if(messaging.message.hasOwnProperty('is_echo'))
							{	
								json_final.psid_webhook_usuario = messaging.recipient.id;
								json_final.saliente = 'true';
							
								//es un mensaje saliente 
								//Si es saliente entoncess el que recibe es el usuario
								
								//consultar si existe el usuario en la BD
								
								console.log("-----------PASO 1.1 JSON IDENTIFICADO COMO MENSAJE SALIENTE")
								funcion_retorno({"mensaje": "saliente"}, 'consultar_usuario', psid_webhook_usuario)
								.then(usuario_ok => {
									console.log("----------PASO 3 --------INSERTAR JSON")
									console.log("Json_final: ",json_final)
									funcion_retorno({"mensaje": "saliente"}, 'insertar', json_final)
									.then(insertado => {
										
										respuesta(insertado)

									})
									.catch(error_insertando => rechazo(error_insertando))

									
								})
								.catch(usuario_no_ok => {
									console.log("usuario no ok no ok ")
									rechazo();
								});
								
								

							}else{

								//funcion_retorno({"mensaje": "entrante"}, 'ignorar');
								//es un mensaje saliente 
								//Si es saliente entoncess el que recibe es el usuario
								psid_webhook_usuario = messaging.sender.id;
								json_final.saliente = 'false';
				
								//consultar si existe el usuario en la BD
								
								console.log("-----------PASO 1.1 JSON IDENTIFICADO COMO MENSAJE ENTRANTE")
								funcion_retorno({"mensaje": "entrante"}, 'consultar_usuario', psid_webhook_usuario)
								.then(usuario_ok => {
									console.log("----------PASO 3 --------INSERTAR JSON")
									console.log("Json_final: ",json_final)
									funcion_retorno({"mensaje": "saliente"}, 'insertar', json_final)
									.then(insertado => {
										
										respuesta(insertado)

									})
									.catch(error_insertando => rechazo(error_insertando))
								})
								.catch(usuario_no_ok => {
									console.log("usuario no ok no ok ")
									rechazo();
								});
								
								//es un mensaje entrante
							}
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


