module.exports.indentificarJSON = function(json, funcion_retorno){

			if (json.object == 'page'){

				funcion_retorno("Objeto de page");
				if(json.entry[0].hasOwnProperty('messaging')){
						funcion_retorno("Mensaje entarnte o saliente");
				}else
			{
				funcion_retorno("NO es un mensaje");
			}
			}else{	
				funcion_retorno("Objeto desconocido");
			}
			

			console.log("sigue la funcion Identifcar JSON");

			return "verdaderos";
};