const tbface_log                = "tbface_log";
const tbface_usuario            = "tbface_usuario";
const tbface_page               = "tbface_page";
const tbface_mensaje            = "tbface_mensaje";
const tbface_permiso_face_page  = "tbface_permiso_face_page";
const tbface_attachments        = "tbface_attachment";
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
      sql_insertar_atachments = sqlstring.format("INSERT INTO "+tbface_attachments+"(id_interaccion, type, url) VALUES( ?, ?, ? )",
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
      sql_consultar_page=sqlstring.format("SELECT * FROM "+tbface_page+" WHERE id_page = ?", [json_id_page]);
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
      sql_consultar_usuario = sqlstring.format("SELECT * FROM "+tbface_usuario+" where psid_webhook_usuario = ? ",[psid]);
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
      var sql_insertar_user = sqlstring.format("INSERT INTO "+tbface_usuario+"(psid_webhook_usuario,id_page,fecha_actualizacion)"+
        " VALUES(?, ?, now()); SELECT currval('tbface_usuario_id_usuario_seq'); ",[json.psid_webhook_usuario,json.id_page]);
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
        console.log("Reject conexion.query(sql_consultar_usuario)")
        reject(e);
      })
      }else{
        reject("JSON Vacio");
    }
  });
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
        cargarlog({"Dentro de funcion ejecutarQuery()" : "OK"});
        console.log("----------------PASO 3.1---- POR INSERTAR")
        console.log("dataso : ",dato)
        var id_interaccion = Math.floor(Math.random() * (10000 - 1)) + 1;
        dato.mid= sqlstring.escape("'"+ Math.floor(Math.random() * (100000 - 1)) + 1+dato.mid+"'");
        var sql_insertar_mensaje = sqlstring.format("INSERT INTO "+tbface_mensaje+
          " ( id_usuario, id_mensaje, fecha, fecha_time,saliente,mensaje,fecha_leido, fecha_alta"+
          ",fecha_actualizacion,oprid,estado) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); select currval('seq_interaccion');",
          [dato.id_usuario,dato.mid, 'now()',dato.time,dato.saliente,dato.text,'123123', 'now()', 'now()','1', '1']);
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
        sql_log = sqlstring.format("INSERT INTO "+tbface_log+"(json_data, estado, detalle) VALUES(?, ?, ?); SELECT currval('tbface_log_id_log_seq');",[JSON.stringify(json),'0', detalle]);
      break;
      case 'update':
        var id_log = data.hasOwnProperty('id_log') ?  data.id_log : reject("Falta id_log para realizar UPDATE");
      sql_log = sqlstring.format("UPDATE "+tbface_log+" SET estado= ?, detalle = ? WHERE id_log= ?;",[estado,detalle,id_log]);
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

