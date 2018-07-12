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
    rej("Insertar JSON no finalizo correctamente: "+mal.stack)

  });
  function ejecutarQuery(dato, cargarlog, conexion){
        
         return new Promise((resolve, reject)=>{
              cargarlog({"Dentro de funcion ejecutarQuery()" : "OK"});
                console.log("----------------PASO 3.1---- POR INSERTAR")  
               crearQuery(dato)
               
               var sql_insertar_mensaje = {
                      text: 'INSERT INTO '+tbface_mensaje+
                      ' (id_interaccion, id_usuario,id_mensaje, fecha, fecha_time,saliente,mensaje,fecha_leido, fecha_alta'+
                      ',fecha_actualizacion,oprid,estado) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                      values: ['brianc', 'brian.m.carlson@gmail.com'],
                              } 
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
        /*
function(queryparainsertar){

                console.log("dentro de la funcion de crear query");
                if (!queryparainsertar){

            
                    client.end();
                    ok = "la variable esta vacia";
                    cargarlog({"Variable " : "Vacia"});
                    console.log(ok);
                    return ok;
                  }else
                    {
                      cargarlog({" Query para insertar" : queryparainsertar});
                      ok = "query ok ok ";
                      console.log(ok);
                    }
                      
                    
                    client.query(queryparainsertar)
                    .then(resultado => {cargarlog({"Client.query" : resultado});})
                    .catch( error => {cargarlog({"Client.query" : error});});

                });
        
        */


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
                                if(result.rows[0]){
                                  funcion_existencia({"Resultado: " : result.rows[0]}, 'existe');
                                  console.log("------------PASO 2.2--EXISTE USUARIO");
                                  res()
                                  
                                } 
                                
                              })
                              .catch(e => {
                                funcion_existencia({"Error: " : e.stack});
                                console.log("------------PASO 2.2--NO EXISTE USUARIO");
                                console.error(e.stack);
                               
                                rej();
                              })


/*
                    var consulta = conexion.query(sql_consultar_usuario, function(err, result){

                       if(err) {

                        ok = "Error corriendo la sql_consultar_usuario";
                        funcion_existencia({"Error con Query para insertar" : err});
                        console.log(ok, err);
                        return ok;
                         // res.send('<pre>Error corriendo la sql_consultar_usuario: '+ err +'</pre>');
                        return console.error('Error corriendo la sql_consultar_usuario:', err);
                        }else {
                          funcion_existencia({"qUERY CONSULTA " : "OK"});
                          ok = result;
                          console.log(ok);
                        }               
                        //  res.send('<pre> corriendo la sql_consultar_usuario: ' + JSON.stringify(result) + '</pre>')
                        //console.log(result.rows[0].theTime);
                        //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
                        conexion.end((err)=>{
                            if(err){
                              funcion_existencia({"Error desconectando de Postgresql " : err});
                            }else{
                              funcion_existencia({"Desconectado de la BD" : "OK"});
                            }
                        });
                        return ok;
                      });
                    */
                  
                }else{
                  rej()
                }

            });
           

}


            
        
           





module.exports.actualizar_pages = function(conexionBD, callback){
    callback({"Dentro de funcion consultar_usuario()" : "OK"});
                

                 

};