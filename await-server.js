const db = require('./modulos/db');;
const sqlstring = require('sqlstring');
const request = require("request");


indentificarJSON = async function(json, funcion_retorno,client){
		console.log("-----------PASO 1----IDENTIFICANDO JSON")
		var json_final={};
		var json_page = {};
		var id_msj_insertado;
		var data_log = {detalle : 'Init',
							estado: 0};
		var persona = {};
		if(json && typeof(json)=='object'){
			if (json.hasOwnProperty('object') && json.object == 'page')
			{
				//
				//si es un objeto de pagina
				//Si existe la propiedad entry
				if (json.hasOwnProperty('entry'))//##INICIO SI ENTRY --
				{
					json_final.id_page=json.entry[0].id;
					json_final.time=json.entry[0].time;
					var page_ok = await db.consultar_page(json_final.id_page, funcion_retorno, client)
					console.log(page_ok)
				
				}else{
					//si no existe la propiedad entry
					
					console.log({"NO es":" un mensaje"},'abortar');

				}////Cierre if(entry exist)##FIN SI ENTRY --
			}else
			{	
					console.log("-----------PASO 1----ERROR IDENTIFICANDO JSON")
					
						console.log({"NO es":" page"},'abortar');

			} //Cierre if(object=='page')
				


		}

			
		
}; //Cierre funcion

var json = {"object": "page",
			"entry": [{
				"id": "123151313153",
				"time": "155123513115"
				}]
		}
indentificarJSON(json);