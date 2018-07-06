
module.exports.insertarJSON = function(valor, retorno){
      
      funcion_retorno=retorno;

      var reqbody   =   valor;
    var pg        =   require('pg');
    var sqlString =   require('sqlstring');
    //var conString =   require('conf-postgresql').PGURL 
    var conString =   process.env.ELEPHANTSQL_URL || "postgres://admin:admin@10.30.0.231:5432/db_inscripcion" ;    
   

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
                    console.log(ok);
                    return ok;
                  }else
                    {
                      ok = "query ok ok ";
                      console.log(ok);
                    }

                    client.query(queryparainsertar, function(err, result){

                       if(err) {

                        ok = "Error corriendo la queryparainsertar";
                        console.log(ok, err);
                        return ok;
                         // res.send('<pre>Error corriendo la queryparainsertar: '+ err +'</pre>');
                        return console.error('Error corriendo la queryparainsertar:', err);
                        }else {
                          ok = "query ok ok  ok";
                          console.log(ok);
                        }               
                        //  res.send('<pre> corriendo la queryparainsertar: ' + JSON.stringify(result) + '</pre>')
                        //console.log(result.rows[0].theTime);
                        //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
                        client.end();
                        return ok;
                      });

                });
        
            });


}
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



