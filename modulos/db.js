const tbface_log                = "tbface_log";
const tbface_usuario            = "tbface_usuario";
const tbface_page               = "tbface_page";
const tbface_mensaje            = "tbface_mensaje";
const tbface_permiso_face_page  = "tbface_permiso_face_page";
const tbface_attachments        = "tbface_attachments";

const pg          =   require('pg');
const sqlString   =   require('sqlstring');
//const conString =   require('conf-postgresql').PGURL 
const conString   =   process.env.ELEPHANTSQL_URL || "postgres://admin:admin@10.30.0.231:5432/db_inscripcion" ;  



module.exports.insertarJSON = function(valor, retorno, conexion){


  return new Promise((res, rej)=>{
      const reqbody     =   valor;  
      funcion_retorno=retorno;
      
   

  ejecutarQuery(reqbody, funcion_retorno, conexion)
  .then((ok)=>{
    console.log("then resolve 1.0 ");
    res("InsertarJson Finalizo coreecatmente")
  })
  .catch((mal)=>{
    console.log("reject 1.0");
    rej("Insertar JSON no finalizo correctamente: "+mal)

  });
  function ejecutarQuery(dato, cargarlog, conexion){
        
         return new Promise((resolve, reject)=>{
              cargarlog({"Dentro de funcion ejecutarQuery()" : "OK"});
                console.log("----------------PASO 3.1---- POR INSERTAR")  
               //crearQuery(dato)
                 console.log("dataso : ",dato)
               var id_interaccion = Math.floor(Math.random() * (10000 - 1)) + 1;
               var d = new Date(dato.timestamp);
                var timeStamp = d.getTime();
                dato.timestamp = timestamp;

               var sql_insertar_mensaje = {
                      text: 'INSERT INTO '+tbface_mensaje+
                      ' (id_interaccion, id_usuario,id_mensaje, fecha, fecha_time,saliente,mensaje,fecha_leido, fecha_alta'+
                      ',fecha_actualizacion,oprid,estado) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                      values: [id_interaccion, dato.psid_webhook_usuario,dato.mid,
                      dato.time,dato.timestamp,dato.saliente,dato.text,'null','','','',''],
                              } 
                                console.log(sql_insertar_mensaje)
              conexion.query(sql_insertar_mensaje)
                    .then((respuesta) => {
                cargarlog({" Query para insertar " : respuesta});
                      ok = "query ok ok -- -- - ";
                      console.log(ok);
                    conexion.query(respuesta)
                    .then(resultado => {
                      cargarlog({"Client.query" : resultado.rows[0]});
                      resolve("okokoo")
                    })
                    .catch( error => {
                      cargarlog({"Client.query" : error});
                      reject(error)

                    });

              })
              .catch((e) => {
                reject("Hubo un error"+e)
              })


         

         })

       


};


function crearQuery(jsondata){

  return new Promise((resolve, reject)=>{
    console.log("----------------PASO 3.2---- CREANDO LA QUERY")  
        //var obj = JSON.parse(received_updates);
    console.log("jason data", jsondata);
    console.log("TYPEOF jason data", typeof(jsondata));
    if (jsondata){


      var detalle = "15_05";
      var insert = "INSERT INTO tbface_log(fecha, json_data, estado, detalle) VALUES (now(), '"+jsondata+"', null, '"+detalle+"' );";
      //var insert = "INSERT INTO tbface_log(fecha, id_page, json_data, saliente, estado, detalle) VALUES (now(), '"+id_page+"', '"+json+"',"+saliente+", "+estado+",'"+detalle+"' );";
       console.log("insert", insert);
       
       resolve(insert);
       
    }else{
      console.log("false",  insert);
      reject("MEnsjaje de error no deifnido");
    
      
    }
    
  })
  
}

  });
    
};
// recibo como parametros: 
//                      psid = el psid de usuario que viene de la funcion recorrer JSON
//                      funcion_existencia 
module.exports.consultar_usuario = function(psid, funcion_existencia, conexion){

return new Promise((res , rej) => {

  if(psid){
                 funcion_existencia({"Dentro de funcion consultar_usuario()" : "OK"});
                  
            
                

              sql_consultar_usuario = "SELECT * FROM "+tbface_usuario+" where psid_webhook_usuario = '"+psid+"';"; 
              
            
                      funcion_existencia({" Query para insertar" : sql_consultar_usuario});

                        conexion.query(sql_consultar_usuario)
                              .then(result => {
                                console.log("------------PASO 2.1---")
                                console.log(sql_consultar_usuario)
                                if(result.rows[0]){
                                  funcion_existencia({"Resultado: " : result.rows[0]}, 'existe');
                                  console.log("------------PASO 2.2--EXISTE USUARIO");
                                  res()
                                  
                                }else{
                                  console.log("------------PASO 2.2--NO EXISTE USUARIO");
                                  rej();
                                }
                                
                              })
                              .catch(e => {
                                funcion_existencia({"Error: " : e.stack});
                                console.log(e.stack);
                                rej(e);
                              })

                }else{
                  rej()
                }

            });
           

}