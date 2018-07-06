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



module.exports.insertarJSON = function(valor, retorno){
      const reqbody     =   valor;  
      funcion_retorno=retorno;
  
   

  ejecutarQuery(reqbody, funcion_retorno);
  function ejecutarQuery(dato, cargarlog){
        
         
          cargarlog({"Dentro de funcion ejecutarQuery()" : "OK"});
          var client = new pg.Client({
             connectionString: conString,
          });

          client.connect(function(err){


            if(err) {
            
            cargarlog({"Client.connect() No es posible conectar con postgres " : err});
            console.log("Client.connect() No es posible conectar con postgres ");
            return err;

            }else {

              cargarlog({"Client.connect() Conectado con postgres " : "OK"});
              console.log("Client.connect() Conectado con postgres ");
              }


              var queryInsert = crearQuery(dato, function(queryparainsertar){

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
        
            });


};


function crearQuery(jsondata, devolucion){
    //var obj = JSON.parse(received_updates);
    console.log("jason data", jsondata);
    console.log("TYPEOF jason data", typeof(jsondata));
    if (jsondata){


      var detalle = "jueves 17:47";
      var insert = "INSERT INTO tbface_log(fecha, json_data, estado, detalle) VALUES (now(), '"+jsondata+"', null, '"+detalle+"' );";
      //var insert = "INSERT INTO tbface_log(fecha, id_page, json_data, saliente, estado, detalle) VALUES (now(), '"+id_page+"', '"+json+"',"+saliente+", "+estado+",'"+detalle+"' );";
       console.log("insert", insert);
       
       devolucion(insert);
       
    }else{
      console.log("false",  insert);
      devolucion(false);
    
      
    }
    return false;
}
};
// recibo como parametros: 
//                      psid = el psid de usuario que viene de la funcion recorrer JSON
//                      funcion_existencia 
module.exports.consultar_usuario = function(psid, funcion_existencia){




            if(psid){
                 funcion_existencia({"Dentro de funcion consultar_usuario()" : "OK"});
                      var client = new pg.Client({
                      connectionString: conString,
                    });

                 client.connect(function(err){


            if(err) {
            
            funcion_existencia({"Client.connect() No es posible conectar con postgres " : err});
            console.log("Client.connect() No es posible conectar con postgres ");
            return err;

            }else {

              funcion_existencia({"Client.connect() Conectado con postgres " : "OK"});
              console.log("Client.connect() Conectado con postgres ");
              }

              sql_consultar_usuario = "SELECT * FROM "+tbface_usuario+" where psid_webhook_usuario = '"+psid+"';"; 
              
            
                      funcion_existencia({" Query para insertar" : sql_consultar_usuario});
                      ok = "query ok ok ";
                      console.log(ok);
                    
                        client.query(sql_consultar_usuario)
                              .then(res => {
                                if(res.rows[0]){
                                  funcion_existencia({"Resultado: " : res}, 'existe');
                                } 
                                


                                console.log(res.rows[0]);
                              })
                              .catch(e => {funcion_existencia({"Error: " : e.stack});console.error(e.stack)})
                    var consulta = client.query(sql_consultar_usuario, function(err, result){

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
                        client.end((err)=>{
                            if(err){
                              funcion_existencia({"Error desconectando de Postgresql " : err});
                            }else{
                              funcion_existencia({"Desconectado de la BD" : "OK"});
                            }
                        });
                        return ok;
                      });

                });

            }
           
        
           


};


