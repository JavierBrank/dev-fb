const config                    = require('./conf'); 
const sqlstring   =   require('sqlstring');


module.exports.insertarAdjuntos = function(array_adjuntos, client, id_interaccion){
  return new Promise((resolve, reject) => {
    if(array_adjuntos){
      let cantidad_adjuntos = array_adjuntos.length;
      array_adjuntos.forEach((attach0, index_attach, array_attach)=>{
        sql_insertar_atachments = sqlstring.format("INSERT INTO "+config.tbface.attachments+"(id_interaccion, type, url) VALUES( ?, ?, ? )",
        [id_interaccion,attach0.type,attach0.payload.url]);
        console.log("SQL ATTACHMENT>>",sql_insertar_atachments)
        client.query(sql_insertar_atachments)
        .then(attachments_ok => {
          if(index_attach==cantidad_adjuntos-1){
            resolve(cantidad_adjuntos)
          }
        })
        .catch(error => {
          console.log("Error insertando attachment")
          reject(error)
        })
      })
    }else{
      erroratach = "JOSN insertarATTACHMENTS vacio";
      console.log(erroratch)
      reject(new Error(erroratch));
    }
  })
}

module.exports.consultarPage = function(json_id_page, client){
  return new Promise((resolve, reject)=>{
    if(json_id_page){
      let sqlsqtring_consultar_page =  "SELECT id_page id, token_page token, habilitado enabled FROM "+config.tbface.page+" WHERE id_page=?"
      sql_consultar_page=sqlstring.format(sqlsqtring_consultar_page, [json_id_page]);
      console.log(sql_consultar_page);
      client.query(sql_consultar_page)
      .then(page_exist => {
        if(page_exist.rows[0]){
        console.log("Page exist. ",page_exist.rows[0].id);
        resolve(page_exist.rows[0])
        }else{
          //console.log(page_exist);
          resolve(false)
        }
      })
      .catch(error => {
        console.log(error);
        reject(error)
      })
    }
  })
}
//   recibo como parametros: psid = el psid de usuario que viene de la funcion recorrer JSON
//                      funcion_existencia 
module.exports.consultarUsuario = function(psid, client){
  return new Promise((resolve , reject) => {
    if(psid){
      let persona = {};
      sql_consultar_usuario = sqlstring.format("SELECT id_usuario id, cod_persona FROM "+config.tbface.usuario
                                              +" WHERE psid_webhook_usuario = ?",[psid]);
      client.query(sql_consultar_usuario)
      .then(result => {
        console.log("------------PASO 2.1---")
        console.log(sql_consultar_usuario)
        if(result.rows[0]){
          //Si existe rows[0] quiere decir que el usuario existe
          persona.id = result.rows[0].id;
          persona.cod_persona = result.rows[0].cod_persona;
          console.log("------------PASO 2.2--EXISTE USUARIO EN tbface_usuario");
          resolve(persona)
          }else{
            console.log("------------PASO 2.2--NO EXISTE USUARIO");
            resolve(false);
        }
                                  
        })
      .catch(error => {
        console.log("Error consultando usuario")
        reject(error);
      })
    }else{
        let error_consultarUsuario ="Error en consultarUsuario(): Falta PSID";
        console.log(error_consultarUsuario);
        reject(new Error(error_consultarUsuario));
    }

  });
}

module.exports.insertarUsuario= function(json, client){
  return new Promise((resolve, reject)=> {
    if (json && client){
      let cod_persona=0;
      let sql_insertar_user = sqlstring.format("INSERT INTO "+config.tbface.usuario+"(psid_webhook_usuario,id_page,fecha_actualizacion, cod_persona)"+
        " VALUES(?, ?, now(), ?); SELECT currval('tbface_usuario_id_usuario_seq'); ",[json.psid_webhook_usuario,json.id_page,cod_persona]);
      console.log(sql_insertar_user);
      client.query(sql_insertar_user)
      .then(result => {
        console.log("------------PASO 3.1---")
        let currval = result[1].rows[0];
        //console.log("Currval is: 0000000000000000000000000000000",result[1].rows[0]);
        resolve(currval);
        })
      .catch(error => {
        console.log("Reject client.query(sql_consultar_usuario)")
        reject(error);
      })
    }else{
        reject(new Error("Error en insertarUsuario(): JSON VACIO"));
    }
  });
}

module.exports.insertarMensaje = function(dato, client){
  return new Promise((resolve, reject)=>{
    let dates = convertirFecha(dato.timestamp);
    if(dato.saliente == 'true')
      {
        /*esto es porque la "fecha_time" cuando es saliente se inicializa en 1
        para indicar que el mensaje fue enviado y se actualizará 
        cuando venga el informe de entrega del webhook en la funcion informeEntrega()*/
        dato.timestamp = 1;
        dato.leido=1;
      }else{
        dato.leido=0;
      }
      console.log("------PASO 3.1---- POR INSERTAR JSON MENSAJE")
      //dato.mid= sqlstring.escape("'"+ Math.floor(Math.random() * (100000 - 1)) + 1+dato.mid+"'");
      let sql_insertar_mensaje = sqlstring.format("INSERT INTO "+config.tbface.mensaje+
        " ( id_usuario, id_mensaje, fecha, fecha_time,saliente,mensaje,fecha_leido, fecha_alta"+
        ",fecha_actualizacion,oprid,estado) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); select currval('seq_interaccion');",
        [dato.id_usuario,dato.mid,dates,dato.timestamp,dato.saliente,dato.text,dato.leido, 'now()', 'now()','1', '1']);
      console.log(sql_insertar_mensaje)
      client.query(sql_insertar_mensaje)
        .then((id_interaccion) => {
          console.log({ "id_interaccion del msj " : id_interaccion[1].rows[0].currval})
          let saliente = (dato.saliente=='true') ? "saliente" : "entrante";
          let msj = "Mensaje"+saliente+" insertado en la BD ";
          resolve({id: id_interaccion[1].rows[0].currval, msj : msj});
        })
        .catch((error) => {
          console.log("Reject insertarMensaje")
          reject(error)
        })
  })
};
module.exports.informeEntrega = function(json, client){
    return new Promise((resolve, reject) => {
        //la variable -dates- contendrea el valor timestamp en fomato ISO 
      let dates = convertirFecha(json.timestamp);
      if(json.watermark && json.mid){
        let sql_informe_entrega=sqlstring.format("UPDATE "+config.tbface.mensaje+" SET fecha_time = ?, fecha_actualizacion= now() WHERE  id_mensaje = ?"
          ,[json.watermark, json.mid])
        console.log(sql_informe_entrega)
        //Si en el argumetno json viene un objeto con la propiedad watermark y mid
        //entonces construyo - ejecuto la query y ya termino la funcion devolviendo un valor de Ok o Error 
        client.query(sql_informe_entrega)
        .then((act=>{
          resolve(act)
        }))
        .catch(error => {
          reject(error)
        })
        
      }else if(json.midausente){
        //Si no tengo los mids. 
        /*Primero: traer el id_usuario de la tabla tbface_usuario conociendo el id_webhook_usuario(PSID)
        Segundo: con ese id voy a aactualizar todos los registros pertenecientes a ese PISD anteriores a la fecha watermark
        que no se hayan actualizado antes*/
        console.log("TRAER ID")
        let sql_traer_id =sqlstring.format("SELECT DISTINCT "+config.tbface.usuario+".id_usuario AS id FROM "+config.tbface.usuario+
        " INNER JOIN "+config.tbface.mensaje+" ON "+config.tbface.usuario+".psid_webhook_usuario = ?",[json.psid_webhook_usuario]);
        console.log(sql_traer_id)
        //query para traer el ID_USUARIO
        client.query(sql_traer_id)
        .then(objeto_resultado=>{
          /*Aca estoy recibiendo un objeto en "objeto_resultado" con los valores de la respuesta de la query
          A ese objeto le extraigo el valor id_usuario accediendo a la propiedad rows la cual es un array con un objeto dentro
          objeto_resultado.rows[{ id : '29' }]*/
          if(objeto_resultado.rows!=[]){
            /*cuando fecha_time está en valor 1 quiere decir que aun no fue entregado*/
            let sql_informe_entrega=sqlstring.format(
              "UPDATE "+config.tbface.mensaje+" "+
              "SET fecha_time = ?, fecha_actualizacion= now() "+
              "WHERE id_usuario=? and fecha <= ? and fecha_time=1"
            ,[json.watermark,objeto_resultado.rows[0].id, dates])
            console.log(sql_informe_entrega)
            /*retorno la promesa client.query() y espero la respuesta del update 
            en el siguiente .then() en caso de ser positiva
            sino caera en el .catch*/
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
          let rc = respuesta_final.hasOwnProperty('rowCount') ?  respuesta_final.rowCount : 0;
          //si rc es distinto a 0 y a null entonces muestro el mensaje con la cantidad sino muestro el segundo mensaje
          let mensaje = (rc !=0 && rc != null) ? rc+" Mensaje(s)-Actualizado(s)" : "No hay mensajes que actualizar"
          console.log(mensaje)
          resolve(mensaje)
          
        })
        .catch(error => {
          console.log("ERROR: UPDATE MENSAJE DELIVERY")
          reject(error)
        })
      }else
      {
        reject(new Error("Error en informeEntrega(): Faltan datos"));
      }
    })        

}
module.exports.informeLectura = async function(json, client){
  return new Promise((resolve, reject)=>{
    if(json.watermark){
      json.watermark_converter = convertirFecha(json.watermark)
      let sql_traer_id =sqlstring.format("SELECT DISTINCT "+config.tbface.usuario+".id_usuario AS id FROM "+config.tbface.usuario+
        " INNER JOIN "+config.tbface.mensaje+" ON "+config.tbface.usuario+".psid_webhook_usuario = ?",[json.psid_webhook_usuario]);
      
      client.query(sql_traer_id)
      .then((id_usuario=>{
        return new Promise((res,rej)=>{
          console.log("OBTENIENDO ID_USUARIO ")
          console.log("Sql: ",sql_traer_id)
          if(id_usuario.rows[0]){
            res(id_usuario.rows[0].id)
          }else{
            rej(new Error('Error en infromeLectura(): Usuario no existe en BD'));
          }
        })
        
      }))
      .then(user_id=>{
        let sql_actualizar_msj= sqlstring.format("UPDATE "+config.tbface.mensaje
        +" SET fecha_leido=?, fecha_actualizacion = now() WHERE id_usuario=? AND saliente = true AND fecha <= ? and fecha_leido=1"
        ,[json.watermark,user_id,json.watermark_converter]);
        console.log("ACTUALIZANDO REGISTROS ")
        console.log("Sql: ",sql_actualizar_msj)
        return client.query(sql_actualizar_msj)

      })
      .then(resultado_final=>{
        let msj = (resultado_final.rowCount!=0) ? "I. Lectura: "+resultado_final.rowCount+" Mensaje(s) atcualizado(s)" : "I.Lectura: No hay mensajes que actualizar";
        console.log(msj)
        console.log("res final::",resultado_final)
        resolve(msj);
      })
      .catch(error => {
        console.log("ERROR: UPDATE MENSAJE READ")
        reject(error)
      })
  }else
  {
    reject(new Error("Error en informeLectura(): Falta propiedad watermark en el objeto"));
  }
    
  });
  }

module.exports.insertarLog = function(dataJson){
  return new Promise((resolve, reject)=>{
    let json = dataJson.postJson;
    let client = dataJson.client;
    let json_data = sqlstring.format(JSON.stringify(json));
    let detalle = json.hasOwnProperty('detalle') ?  json.detalle : 'init';
    let  sql_log = sqlstring.format("INSERT INTO "+config.tbface.log+"(json_data, estado, detalle) VALUES(?, ?, ?);"+
      " SELECT currval('tbface_log_id_log_seq');",[json_data,'0', detalle]);
    console.log("INSERTAR LOG ",sql_log)
    client.query(sql_log)
    .then(id_log=>{
      dataJson.dataLog.id = id_log[1].rows[0].currval;
        resolve(dataJson);
    })
    .catch(error=>{
      reject(error);
    })
  });
};

//json: json ---
//detalle: U comentario de lo que sucedio
//client:  valor de conexion para la query
// accion: si se debe insertar o actualizar

module.exports.actualizarLog = function(dataJson){
  return new Promise((resolve, reject)=>{
    let data = dataJson.dataLog;
    let client = dataJson.client;
    console.log("--------------------------------")
    let sql_log;
    let estado = data.hasOwnProperty('estado') ?  data.estado : 0;
    let detalle = data.hasOwnProperty('detalle') ? +"-"+data.detalle : 'none';
    let id_log = data.hasOwnProperty('id') ?  data.id : reject(new Error("Error en guardarLog(): Falta id_log para realizar UPDATE"));
    sql_log = sqlstring.format("UPDATE "+config.tbface.log+" SET estado= ?, detalle = ? WHERE id_log= ?;",[estado,detalle,id_log]);
    console.log("SQL UPDATE LOG >>", sql_log);
    client.query(sql_log)
    .then(id_log=>{
      dataJson.dataLog.result = id_log;
      resolve(dataJson);
    })
    .catch(err=>{
      dataJson.error = err;
      reject(dataJson); 
    });
  });
};



let convertirFecha = function(timestamp){
 
    try{
       if(timestamp){
          let dat = new Date(timestamp);
          let monts,
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
      //var expr_reg =/[a-z\d._%+-]+@[a-z\d.-]+\.[a-z]{2,4}\b/
      let reg = /(([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|([a-zA-Z0-9\-\.]+))\.([a-zA-Z]{2,4}|[0-9]{1,3})(\]?))/
      let valida_mail = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i
      let persona = {}
      //text.match()busca la expresion regular(mail) dentro del texto y devuelve un array
      let indice = texto.match(reg)
      if(indice){
        let mail = indice[0]
        console.log("MAIL: se encontró: ",mail)
        //en la posicion 0 del array se encuentra el mail
        if(mail.match(valida_mail)){
          //Valido mail
          if(mail.match(/\@palermo\./)){
            //valido que no sea de @palermo
            resolve(false)
          }else
          {
            persona.mail = mail
            //split() devuelve un array en la posicion[0] esta lo que está a la izquierda del @ 
            // en la posicion 1 el dominio del mail
            persona.nombre = mail.split('@')[0]+'@'
            console.log("Nombre es: "+persona.nombre+" Mail: "+persona.mail)
            resolve(persona)
          }
        }else{
          resolve(false)
        }
      }else{
        console.log("MAIL: No se ha encontrado ninguna coincidencia")
        resolve(false)
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
      let p = persona;
      //Si la persona ya tiene un cod_persona no se inserta la cabecera solo se devuelve el cod_inscripto de la persona
      if(persona.con_cod_persona){
        return resolve(persona.cod_inscripto)
      }
      if(p.hasOwnProperty('nombre_facebook'))

      {
        p.nombre= (p.nombre_facebook != ' ') ? p.nombre_facebook : p.nombre
      }
      let string_sql = "INSERT INTO "+config.tb.persona+"(nombre, apellido, sexo) VALUES(?, ?, ?); SELECT CURRVAL('seq_inscripcion');";
      let sql_alta_cabecera_persona=sqlstring.format(string_sql,[p.nombre, persona.apellido_facebook, persona.genero])
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
      let sql_alta_mail_persona = sqlstring.format("INSERT INTO "+config.tb.mail.all+"(cod_inscripto, mail, tipo, desde, mail_tipo) VALUES"+
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
        console.log("actualizando user")
        let sql_actualizar_user=sqlstring.format("UPDATE "+config.tbface.usuario+
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
      .catch(error=>{
        //Si cualquiera de las querys salio mal cae aca
        console.error("Error en la funcion altaMailPersona()", error)
        reject(error)
      })
    }else{
      reject(new Error("Falta el objeto persona para insertar mail"));
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

