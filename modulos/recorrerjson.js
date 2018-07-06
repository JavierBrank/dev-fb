



module.exports.indentificarJSON = function(json, funcion_retorno){
			
			var id_page = "ID de pagina";
			var mid = "ID de mensaje";
			var text = "Texto del mensaje";
			var saliente = "false";
			var attachments_type = "Image / Video";
			var attachments_payload_url = "URl";
			var psid_webhook_usuario = "PSID user";

			if (json.object == 'page')
			{
				//si es un objeto de pagina
				//Si existe la propiedad entry
				if (json.hasOwnProperty('entry')){

					funcion_retorno({"Objeto": "page"},'ignorar'); //Cargar log y seguir procesando
					//recorro el array Entry[index] como entry 
					// La funcion forEach() me retorna el primer parametro el entry actual del array, indice del elemnto, array
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
								id_page = messaging.recipient.id;

								//Es un informe de entrega
						}
						//Si existe el atributo message - pueden ser varias cosas
						if (messaging.hasOwnProperty('message') )
						{	


							//si dentro de message existe la propiedad 'is_echo' quiere decir que es un mensaje saliente
							if(messaging.message.hasOwnProperty('is_echo'))
							{	
								//es un mensaje saliente 
								//Si es saliente entoncess el que recibe es el usuario
								psid_webhook_usuario = messaging.recipient.id;
								mid = messaging.message.mid;
								text = messaging.message.text;
								//consultar si existe el usuario en la BD
								

								funcion_retorno({"mensaje": "saliente"}, 'consultar_usuario', psid_webhook_usuario);
								

							}else{

								//funcion_retorno({"mensaje": "entrante"}, 'ignorar');
								//es un mensaje saliente 
								//Si es saliente entoncess el que recibe es el usuario
								psid_webhook_usuario = messaging.sender.id;
								mid = messaging.message.mid;
								text = messaging.message.text;
								//consultar si existe el usuario en la BD
								

								funcion_retorno({"mensaje": "entrante"}, 'consultar_usuario', psid_webhook_usuario);
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
						}

					});
					
				}else{
					//si no existe la propiedad entry
					funcion_retorno({"Entry":" No existe"},'abortar');
				}
			}else
			{	
				funcion_retorno({"Objeto":" desconocido"},'abortar');
			}
			

				console.log("sigue la funcion Identifcar JSON");

				return "verdaderos";
};


