const config                    = require('./conf'); 
const conString                 =  config.conString; 
const pg          =   require('pg');
const sqlstring   =   require('sqlstring');
var client;

module.exports.conectarDB = function(){
  return new Promise((resolve, reject) => {
    client = new pg.Client({
             connectionString: conString,
          });
          client.connect(function(err){
           if(err) {
            console.log("------------PASO 0 ---------ERROR AL CONECTAR BD");
            reject(err) ;
            }else {
              console.log("------------PASO 0 ------------ CONECTAR BD");
              resolve(client);
            }
      });
  });
};

module.exports.desconectarDB = function(client){
  return new Promise((resolve, reject)=>{
    client.end(function(errorbd){
    if(errorbd){
      console.log("Desconcetado BD Error: ",err); 
      reject(errorbd)
      }else{
        resolve()
      }
    });
  });
}

module.exports.insertarAdjunto = function(json, funcion_retorno, client){
  return new Promise((resolve, reject) => {
    if(json){ 
      sql_insertar_atachments = sqlstring.format("INSERT INTO "+config.tbface.attachments+"(id_interaccion, type, url) VALUES( ?, ?, ? )",
      [json.id_interaccion,json.attachments_type,json.attachments_payload_url]);
      //console.log(sql_insertar_atachments)
      client.query(sql_insertar_atachments)
      .then(attachments_ok => {
        resolve(attachments_ok)
      })  
      .catch(attachments_no_ok => {
        console.log("error atachment 111111111111111111")
        reject(attachments_no_ok)
      })

    }else{
      erroratach = "JOSN insertarATTACHMENTS vacio";
      console.log(erroratch)
      reject(erroratch)
    }
  })
}

module.exports.consultarPage = function(json_id_page, funcion_retorno, client){
  return new Promise((resolve, reject)=>{
    if(json_id_page){
      var sqlsqtring_consultar_page =  "SELECT id_page id, token_page token, habilitado enabled FROM "+config.tbface.page+" WHERE id_page=?"
      sql_consultar_page=sqlstring.format(sqlsqtring_consultar_page, [json_id_page]);
      console.log(sql_consultar_page);
      client.query(sql_consultar_page)
      .then(page_exist => {
        if(page_exist.rows[0]){
        console.log("Page exist. ",page_exist.rows[0].id_page);
        resolve(page_exist.rows[0])
        }else{
          //console.log(page_exist);
          resolve(false)
        }
      })
      .catch(page_error => {
        console.log(page_error);
        reject(page_error)
      })
    }
  })
}
//   recibo como parametros: psid = el psid de usuario que viene de la funcion recorrer JSON
//                      funcion_existencia 
module.exports.consultarUsuario = function(psid, funcion_existencia, client){
  return new Promise((resolve , reject) => {
    if(psid){
      var persona = {};
      funcion_existencia({"Dentro de funcion consultar_usuario()" : "OK"});
      sql_consultar_usuario = sqlstring.format("SELECT id_usuario id, cod_persona persona FROM "+config.tbface.usuario
                                              +" WHERE psid_webhook_usuario = ?",[psid]);
      funcion_existencia({" Query para insertar" : sql_consultar_usuario});
      client.query(sql_consultar_usuario)
      .then(result => {
        console.log("------------PASO 2.1---")
        console.log(sql_consultar_usuario)
        if(result.rows[0]){
          //Si el usuario existe en la base de datos de chat-facebook pregunto si tiene cod_persona dsitinto de 0
          funcion_existencia({"Resultado: " : result.rows[0]}, 'EXISTE');
          persona.id = result.rows[0].id;
          persona.cod_persona = result.rows[0].persona;
          persona.mail = false;
          console.log("------------PASO 2.2--EXISTE USUARIO EN tbface_usuario");
          //resolve(result.rows[0])
          if(result.rows[0].persona!=0){
            console.log("Tiene codigo de persona: ", persona.cod_persona)
            //si tiene cod_persona distinto de cero me fijo si tiene mail
            var sql_consultar_mail= sqlstring.format(
                                    "SELECT DISTINCT m.mail correo FROM tb_mail_all m "+
                                    "INNER JOIN tb_persona p "+
                                    "ON p.cod_inscripto = m.cod_inscripto "+
                                    "AND p.cod_inscripto= ?",[result.rows[0].persona])
            console.log("SQL_CONSULAR_MAIL",sql_consultar_mail)
            client.query(sql_consultar_mail)
            .then(mail_ok=>{
              if(mail_ok.rows[0]){
                console.log("Tiene mail: ",mail_ok.rows[0].correo)
                persona.mail = mail_ok.rows[0].correo
                //devuelvo persona con mail
                resolve(persona)
              }else{
                console.error("No tiene mail")
                resolve(persona)
              }
              
            })
            .catch(mail_error=>{
              console.log(mail_error)
              reject(mail_error)
            })
          }else{
            //Devuelvo usuario con codigo persona = 0
            resolve(persona)
          }
          
          }else{
            console.log("------------PASO 2.2--NO EXISTE USUARIO");
            resolve(false);
        }
                                  
        })
      .catch(e => {
        funcion_existencia({"Error: " : e.stack});
        console.log("Reject client.query(sql_consultar_usuario)")
        rej(e);
        })
      }else{
        console.log("else(sql_consultar_usuario)")
        rej()
    }

  });
}

module.exports.insertarUsuario= function(json, funcion_retorno, client){
  return new Promise((resolve, reject)=> {
    if (json && client){
      var cod_persona=0;
      var sql_insertar_user = sqlstring.format("INSERT INTO "+config.tbface.usuario+"(psid_webhook_usuario,id_page,fecha_actualizacion, cod_persona)"+
        " VALUES(?, ?, now(), ?); SELECT currval('tbface_usuario_id_usuario_seq'); ",[json.psid_webhook_usuario,json.id_page,cod_persona]);
      console.log(sql_insertar_user);
      client.query(sql_insertar_user)
      .then(result => {
        console.log("------------PASO 3.1---")
        var currval = result[1].rows[0];
        //console.log("Currval is: 0000000000000000000000000000000",result[1].rows[0]);
        resolve(currval);
        })
      .catch(e => {
        funcion_retorno({"Error: " : e.stack});
        console.log("Reject client.query(sql_consultar_usuario)")
        reject(e);
      })
      }else{
        reject("JSON Vacio");
    }
  });
}
module.exports.resetDB = function(client){
  return new Promise((resolve, reject)=>{
      client.query("DELETE FROM tbface_LOG; DELETE from tbface_attachment; delete from tbface_mensaje; delete from tbface_usuario")
      .then(res=> {resolve()})
      .catch(rej=>{reject(rej)})
  })
}

module.exports.insertarMensaje = function(reqbody, funcion_retorno, client){
  return new Promise((res, rej)=>{
    ejecutarQuery(reqbody, funcion_retorno, client)
    .then((id_interacion_msj)=>{
      console.log("then resolve 1.0 -- MENSAJE INSERTADO EN LA BD");
      res(id_interacion_msj)
      })
    .catch((mal)=>{
      console.log("Reject ejecutarQuery(reqbody, funcion_retorno, client)", mal);
      rej(mal)
      });
    function ejecutarQuery(dato, cargarlog, client){
      return new Promise((resolve, reject)=>{
       
        var dates = convertirFecha(dato.timestamp);
        if(dato.saliente == 'true')
        { 
          dato.timestamp = 1; //esto es porque la "fecha_time" cuando es saliente
                              //se inicializa en 1 para indicar que el mensaje fue enviado
                              //y se actualizará cuando venga el informe de entrega del webhook
                              //en la funcion informeEntrega()
          dato.leido=1;
        }else {dato.leido=0;}
        
        console.log("------PASO 3.1---- POR INSERTAR JSON MENSAJE")
        //dato.mid= sqlstring.escape("'"+ Math.floor(Math.random() * (100000 - 1)) + 1+dato.mid+"'");
        var sql_insertar_mensaje = sqlstring.format("INSERT INTO "+config.tbface.mensaje+
          " ( id_usuario, id_mensaje, fecha, fecha_time,saliente,mensaje,fecha_leido, fecha_alta"+
          ",fecha_actualizacion,oprid,estado) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); select currval('seq_interaccion');",
          [dato.id_usuario,dato.mid,dates,dato.timestamp,dato.saliente,dato.text,dato.leido, 'now()', 'now()','1', '1']);
        console.log(sql_insertar_mensaje)
        client.query(sql_insertar_mensaje)
        .then((id_interaccion) => {
          cargarlog({" id_interaccion del msj " : id_interaccion})
          console.log({ "id_interaccion del msj " : id_interaccion[1].rows[0].currval})
          resolve(id_interaccion[1].rows[0].currval);
        })
        .catch((e) => {
          console.log("Reject client.query(sql_insertar_mensaje) 2")
          reject(e.message)
        })

      })
    }
  });  
};
module.exports.informeEntrega = function(json, client){
    return new Promise((resolve, reject) => {
        //la variable -dates- contendrea el valor timestamp en fomato ISO 
      var dates = convertirFecha(json.timestamp);
      if(json.watermark && json.mid){
        var sql_informe_entrega=sqlstring.format("UPDATE "+config.tbface.mensaje+" SET fecha_time = ?, fecha_actualizacion= now() WHERE  id_mensaje = ?"
          ,[json.watermark, json.mid])
        console.log(sql_informe_entrega)
        //Si en el argumetno json viene un objeto con la propiedad watermark y mid
        //entonces construyo - ejecuto la query y ya termino la funcion devolviendo un valor de Ok o Error 
        client.query(sql_informe_entrega)
        .then((act=>{
          console.log("UPDATE MENSAJE DELIVERY")
          resolve(act)
        }))
        .catch(err_act => {
          console.log("ERROR: UPDATE MENSAJE DELIVERY")
          reject(err_act)
        })
        
      }else if(json.midausente){
        //Si no tengo los mids. 
        /*Primero: traer el id_usuario de la tabla tbface_usuario conociendo el id_webhook_usuario(PSID)
        Segundo: con ese id voy a aactualizar todos los registros pertenecientes a ese PISD anteriores a la fecha watermark
        que no se hayan actualizado antes*/
        console.log("TRAER ID")
        var sql_traer_id =sqlstring.format("SELECT DISTINCT "+config.tbface.usuario+".id_usuario AS id FROM "+config.tbface.usuario+
        " INNER JOIN "+config.tbface.mensaje+" ON "+config.tbface.usuario+".psid_webhook_usuario = ?",[json.psid_webhook_usuario]);
        console.log(sql_traer_id)
        //query para traer el ID_USUARIO
        client.query(sql_traer_id)
        .then(objeto_resultado=>{
          //Aca estoy recibiendo un objeto en "objeto_resultado" con los valores de la respuesta de la query
          //A ese objeto le extraigo el valor id_usuario accediendo a la propiedad rows la cual es un array con un objeto dentro
          //objeto_resultado.rows[{ id : '29' }]
          if(objeto_resultado.rows!=[]){
            //cuando fecha_time está en valor 1 quiere decir que aun no fue entregado
            var sql_informe_entrega=sqlstring.format(
              "UPDATE "+config.tbface.mensaje+" "+
              "SET fecha_time = ?, fecha_actualizacion= now() "+
              "WHERE id_usuario=? and fecha <= ? and fecha_time=1"
            ,[json.watermark,objeto_resultado.rows[0].id, dates])
            console.log(sql_informe_entrega)
            //retorno la promesa client.query() y espero la respuesta del update 
            //en el siguiente .then() en caso de ser positiva
            //sino caera en el .catch
            return client.query(sql_informe_entrega)
          }else{
            //si no hay resultados solo retorno en objeto con el id usuario a la siguiente promesa
            return objeto_resultado
          }
          
          
        })
        .then(respuesta_final=>{
          //Si existe la propiedad rowCount dentro de respuesta final
          //la propiedad rowCount contiene la cantidad de filas afectadas con un INSERT o UPDATE devuelve 0 o n 
          // En caso de select devuelve null
          var rc = respuesta_final.hasOwnProperty('rowCount') ?  respuesta_final.rowCount : 0;
          //si rc es distinto a 0 y a null entonces muestro el mensaje con la cantidad sino muestro el segundo mensaje
          var mensaje = (rc !=0 && rc != null) ? rc+" Mensaje(s)-Actualizado(s)" : "No hay mensajes que actualizar"
          console.log(mensaje)
          resolve()
          
        })
        .catch(err_act => {
          console.log("ERROR: UPDATE MENSAJE DELIVERY")
          reject(err_act)
        })
        
        
           
      }else
      {
        reject("Faltan datos para actualizar msj de entrega");
      }
    })        

}
module.exports.informeLectura = async function(json, client){
  return new Promise((resolve, reject)=>{
    if(json.watermark){
      json.watermark_converter = convertirFecha(json.watermark)
      var sql_traer_id =sqlstring.format("SELECT DISTINCT "+config.tbface.usuario+".id_usuario AS id FROM "+config.tbface.usuario+
        " INNER JOIN "+config.tbface.mensaje+" ON "+config.tbface.usuario+".psid_webhook_usuario = ?",[json.psid_webhook_usuario]);
      
      client.query(sql_traer_id)
      .then((id_usuario=>{
        return new Promise((res,rej)=>{
          console.log("OBTENIENDO ID_USUARIO ")
          console.log("Sql: ",sql_traer_id)
          if(id_usuario.rows[0]){
            res(id_usuario.rows[0].id)
          }else{
            rej(id_usuario)
          }
        })
        
      }))
      .then(user_id=>{
        var sql_actualizar_msj= sqlstring.format("UPDATE "+config.tbface.mensaje
        +" SET fecha_leido=?, fecha_actualizacion = now() WHERE id_usuario=? AND saliente = true AND fecha <= ? and fecha_leido=1"
        ,[json.watermark,user_id,json.watermark_converter]);
        console.log("ACTUALIZANDO REGISTROS ")
          console.log("Sql: ",sql_actualizar_msj)
        return client.query(sql_actualizar_msj)

      })
      .then(resultado_final=>{
        if(resultado_final.rowCount!=0){
          console.log(resultado_final.rowCount+" Mensaje(s) atcualizado(s)")
        }else{
          console.log("No hay mensajes que actualizar")
        }
        console.log("res final::",resultado_final)
        resolve();
      })
      .catch(err_act => {
        console.log("ERROR: UPDATE MENSAJE READ")
        reject(err_act)
      })
  }else
  {
    reject("Falta watermark")
  }
    
  });
  }

//json: json ---
//detalle: U comentario de lo que sucedio
//client:  valor de conexion para la query
// accion: si se debe insertar o actualizar
module.exports.guardarLog = function(json, client, accion, data){
  return new Promise((resolve, reject)=>{
    var sql_log;
    var estado = data.hasOwnProperty('estado') ?  data.estado : 0;
    var detalle = data.hasOwnProperty('detalle') ?  data.detalle : 'none';

    if(accion){
      switch(accion){
      case 'insert':
        sql_log = sqlstring.format("INSERT INTO "+config.tbface.log+"(json_data, estado, detalle) VALUES(?, ?, ?); SELECT currval('tbface_log_id_log_seq');",[JSON.stringify(json),'0', detalle]);
      break;
      case 'update':
        var id_log = data.hasOwnProperty('id_log') ?  data.id_log : reject("Falta id_log para realizar UPDATE");
      sql_log = sqlstring.format("UPDATE "+config.tbface.log+" SET estado= ?, detalle = ? WHERE id_log= ?;",[estado,detalle,id_log]);
      break;
      default:
        return reject("La accion no es valida")
      }
    }else{
      
        return reject("Debe especificarse una accion")
    }
    client.query(sql_log).then(id_log=>{
      if(accion == 'insert'){
        resolve(id_log[1].rows[0].currval)
      }else{
        resolve(id_log)
      }
    }).catch(err_log=>{reject(err_log)})
    
  });
};



var convertirFecha = function(timestamp){
 
    try{
       if(timestamp){
          var dat = new Date(timestamp);
          var monts,
              day,
              fecha;
          //getMonth() devuelve el mes(0-11) 0=enero..11=Diciembre. por eso se hace este if, para anteponer un cero y sumar 1
          if((dat.getMonth()+1)<10){
            monts='0'+(dat.getMonth()+1)
          }else{
            monts = (dat.getMonth()+1)
          }
          //getData() devuelve el dia(1-31) pero en un un mes menor a 10 devuelve un solo digito, 
          //por eso cuando sea un solo digito se le antepondrá el cero
          if((dat.getDate())<10){
            day='0'+dat.getDate()
          }else{
            day = dat.getDate()
          }
          fecha = dat.getFullYear()+"-"+monts+"-"+day+" "+dat.getHours()+":"+dat.getMinutes()+":"+dat.getSeconds()+"."+dat.getMilliseconds()
           return fecha
        }else{
         throw new Error("Falta el timestamp");
        }
    }catch(error){
         throw error
    }
   
 
}
  
module.exports.buscarCorreo = function(texto){
  return new Promise((resolve, reject)=>{
   
    if(texto){
      var expr_reg =/[a-z\d._%+-]+@[a-z\d.-]+\.[a-z]{2,4}\b/i
      var persona = {}
      //text.match()busca la expresion regular(mail) dentro del texto y devuelve un array
      var indice = texto.match(expr_reg)
      if(indice){
        //en la posicion 0 del array se encuentra el mail
        persona.mail = indice[0]
        //split() devuelve un array en la posicion[0] esta lo que está a la izquierda del @ 
        // en la posicion 1 el dominio del mail
        persona.nombre = indice[0].split('@')[0]+'@'
        console.log("Nombre es: "+persona.nombre+" Mail: "+persona.mail)
         resolve(persona)
      }else{
        console.log("No se ha encontrado ninguna coincidencia",indice)
        //se retonra false para que la funcion que obtiene este valor no continue el proceso
        return resolve(false)
      }
     
    }else{
      console.error("Falta texto en funcion buscarCorreo")
      resolve(false)
    }
  })
}
module.exports.altaCabeceraPersona = function(persona, client){
  return new Promise((resolve, reject)=>{
    if(persona){
      var p = persona;
      //Si la persona ya tiene un cod_persona no se inserta la cabecera solo se devuelve el cod_inscripto de la persona
      if(persona.con_cod_persona){
        return resolve(persona.cod_inscripto)
      }
      if(p.hasOwnProperty('nombre_facebook'))

      {
        p.nombre= (p.nombre_facebook != ' ') ? p.nombre_facebook : p.nombre
      }
      var string_sql = "INSERT INTO "+config.tb.persona+"(nombre, apellido, sexo) VALUES(?, ?, ?); SELECT CURRVAL('seq_inscripcion');";
      var sql_alta_cabecera_persona=sqlstring.format(string_sql,[p.nombre, persona.apellido_facebook, persona.genero])
      console.log("SQL ALTA CABECERA:")
      console.log(sql_alta_cabecera_persona)
      client.query(sql_alta_cabecera_persona)
      .then(re=>{
        console.log("Resultado cod_inscripto", re)
        // en "re" capturamos un array con dos elementos; en cada uno la respuesta de cada query
        // en el elemento 0 (re[0]) se encuentra el Objeto Result del INSERT que no interesa
        // En el elemento 1 (re[1]) se encuentra el Objeto Result del SELECT CURRAL 
        // y en la propiedad rows de re[1] se encuentra un array con las filas devueltas
        // en este caso una sola fila con un solo atributo "currval" como propiedad del objeto
        let cod_inscripto = re[1].rows[0].currval
        console.log("cod_inscripto=",cod_inscripto)
        resolve(cod_inscripto)     
        
      })
      .catch(error=>{
        console.error("Error insertando cabecera persona")
        reject(error)
      })
    }
  })

}
module.exports.altaMailPersona = function(p,client){
  return new Promise((resolve, reject)=>{
    if(p){
      p.tipo='P'
      p.mail_tipo=7
      p.desde= 'Facebook_Chat'
      var sql_alta_mail_persona = sqlstring.format("INSERT INTO "+config.tb.mail.all+"(cod_inscripto, mail, tipo, desde, mail_tipo) VALUES"+
        "(?, ?, ?, ?, ? );",[p.cod_inscripto, p.mail, p.tipo, p.desde, p.mail_tipo])
            console.log("SQL ALTA MAIL:")
      console.log(sql_alta_mail_persona)
      client.query(sql_alta_mail_persona)
      .then(mail_insertado=>{
        //Si el INSERT se concreta exitosamente se muestra un mensaje
        console.log(mail_insertado.rowCount+" Nuevo mail insertado BD")
        return (mail_insertado)
      })
      .then(actualizar_usuario=>{
        if(p.con_cod_persona){return resolve(actualizar_usuario)} 
        console.log("actualizando user")
        var sql_actualizar_user=sqlstring.format("UPDATE "+config.tbface.usuario+
          " SET cod_persona=? WHERE ID_USUARIO = ?",[p.cod_inscripto, p.id_usuario])
        console.log("SQL ACTUALIZAR USER")
        console.log(sql_actualizar_user)
        //Se retorna la promesa_query a la siguiente promesa 

        return client.query(sql_actualizar_user)
      })
      .then(user_update=>{
        //SI la query UPDATE sql_actualizar_user salió bien cae aca el resultado
        console.log(user_update.rowCount+" Usuario actualizado --- ID:"+p.id_usuario+" COD_PERSONA: "+p.cod_inscripto)
        resolve(user_update)
      })
      .catch(error_mail=>{
        //Si cualquiera de las querys salio mal cae aca
        console.error("Error en la funcion altaMailPersona()", error_mail.message)
        reject(error_mail)
      })
    }else{
      reject("Falta el objeto persona para insertar mail")
    }
  })
}
/*
---------------------
----tbface_mensaje---
---------------------
id_interaccion bigint NOT NULL,
  id_usuario bigint NOT NULL, -- ID propio nuestro que le asignamos a cada usuario
  id_mensaje character varying(100) NOT NULL, -- Mid que manda facebook
  fecha timestamp without time zone NOT NULL, -- TIMESTAMP que manda facebook convertido a timestamp
  fecha_time bigint NOT NULL, -- TIMESTAMP que manda facebook
  saliente boolean, -- TRUE saliente...
  mensaje character varying, -- text del msj
  fecha_leido bigint, -- Solo si es un mensaje saliente,  default null
  fecha_alta timestamp without time zone DEFAULT now(), -- Cuando se inserta en la base de datos, no incluir en el INSERT...
  fecha_actualizacion timestamp without time zone NOT NULL DEFAULT now(), -- Cuando se hace un update de algun valor p.ej: FECHA_LEIDO
  oprid character varying, -- Valores...
  estado smallint, -- 99 requiere atencion...

 select currval('seq_interaccion');

[ Result {
    command: 'INSERT',
    rowCount: 1,
    oid: 0,
    rows: [],
    fields: [],
    _parsers: [],
    RowCtor: null,
    rowAsArray: false,
    _getTypeParser: [Function: bound ] },
  Result {
    command: 'SELECT',
    rowCount: null,
    oid: null,
    rows: [ [Object] ],
    fields: [ [Field] ],
    _parsers: [ [Function: parseBigInteger] ],
    RowCtor: null,
    rowAsArray: false } ]


*/

