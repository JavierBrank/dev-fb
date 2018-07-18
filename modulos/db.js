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

module.exports.desconectarDB = function(conexion){
  return new Promise((resolve, reject)=>{
    client = conexion;
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

module.exports.insertarATTACHMENTS = function(json, funcion_retorno, client){
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

module.exports.consultar_page = function(json_id_page, funcion_retorno, client){
  return new Promise((resolve, reject)=>{
    if(json_id_page){
      sql_consultar_page=sqlstring.format("SELECT * FROM "+config.tbface.page+" WHERE id_page = ?", [json_id_page]);
      console.log(sql_consultar_page);
      client.query(sql_consultar_page)
      .then(page_exist => {
        if(page_exist.rows[0]){
        console.log("Page exist. ",page_exist.rows[0].id_page);
        resolve(page_exist.rows[0].id_page)
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
module.exports.consultar_usuario = function(psid, funcion_existencia, conexion){
  return new Promise((res , rej) => {
    if(psid){
      funcion_existencia({"Dentro de funcion consultar_usuario()" : "OK"});
      sql_consultar_usuario = sqlstring.format("SELECT * FROM "+config.tbface.usuario+" where psid_webhook_usuario = ? ",[psid]);
      funcion_existencia({" Query para insertar" : sql_consultar_usuario});
      conexion.query(sql_consultar_usuario)
      .then(result => {
        console.log("------------PASO 2.1---")
        console.log(sql_consultar_usuario)
        if(result.rows[0]){
          funcion_existencia({"Resultado: " : result.rows[0]}, 'existe');
          console.log("------------PASO 2.2--EXISTE USUARIO");
          res(result.rows[0])
          }else{
            console.log("------------PASO 2.2--NO EXISTE USUARIO");
            res(false);
        }
                                  
        })
      .catch(e => {
        funcion_existencia({"Error: " : e.stack});
        console.log("Reject conexion.query(sql_consultar_usuario)")
        rej(e);
        })
      }else{
        console.log("else(sql_consultar_usuario)")
        rej()
    }

  });
}

module.exports.insertarUSER = function(json, funcion_retorno, client){
  return new Promise((resolve, reject)=> {
    if (json && client){
      var sql_insertar_user = sqlstring.format("INSERT INTO "+config.tbface.usuario+"(psid_webhook_usuario,id_page,fecha_actualizacion)"+
        " VALUES(?, ?, now()); SELECT currval('tbface_usuario_id_usuario_seq'); ",[json.psid_webhook_usuario,json.id_page]);
      console.log(sql_insertar_user);
      client.query(sql_insertar_user)
      .then(result => {
        consoldat.log("------------PASO 3.1---")
        var currval = result[1].rows[0];
        //consoldat.log("Currval is: 0000000000000000000000000000000",result[1].rows[0]);
        resolve(currval);
        })
      .catch(e => {
        funcion_retorno({"Error: " : e.stack});
        console.log("Reject conexion.query(sql_consultar_usuario)")
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

module.exports.insertarMSJ = function(reqbody, funcion_retorno, client){
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
        var dat = new Date(dato.timestamp);
          var monts;
          if((dat.getMonth()+1)<10){ monts='0'+(dat.getMonth()+1)}else{monts = (dat.getMonth()+1)}
          var dates = 
          dat.getFullYear()+"-"+monts+"-"+dat.getDate()+" "+dat.getHours()+":"+dat.getMinutes()+":"+dat.getSeconds()+".00001"
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
          reject(e)
        })

      })
    }
  });  
};
module.exports.informeEntrega = function(json, client){
    return new Promise((resolve, reject) => {
          var d = new Date(json.watermark);
          var mont;
          if((d.getMonth()+1)<10){ mont='0'+(d.getMonth()+1)}else{mont = (d.getMonth()+1)}
          var date = 
          d.getFullYear()+"-"+mont+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+".00001"
      if(json.watermark && json.mid){
        var sql_informe_entrega=sqlstring.format("UPDATE "+config.tbface.mensaje+" SET fecha_time = ?, fecha_actualizacion= now() WHERE  id_mensaje = ?"
          ,[json.watermark, json.mid])
        console.log(sql_informe_entrega)
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
        var sql_informe_entrega=sqlstring.format("UPDATE "+config.tbface.mensaje+" SET fecha_time = ?, fecha_actualizacion= now() WHERE  fecha <= ? and fecha_time=1"
          ,[json.watermark, date])
        console.log(sql_informe_entrega)
           client.query(sql_informe_entrega)
        .then((act=>{
          console.log("UPDATE MENSAJE DELIVERY")
          resolve(act)
        }))
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
module.exports.actualizarMSJ = function(json, client){
  return new Promise((resolve, reject)=>{
    if(json.watermark){
      var sql_actualizar_msj= sqlstring.format("UPDATE "+config.tbface.mensaje
      +" SET fecha_leido=?, fecha_actualizacion = now() WHERE saliente = true AND fecha_time <= ? and fecha_leido=1"
      ,[json.watermark,json.watermark]);
      client.query(sql_actualizar_msj)
      .then((act=>{
        console.log("UPDATE MENSAJE READ")
        resolve(act)
      }))
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
module.exports.cargarLOG = function(json, client, accion, data){
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

