/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 //de.facebok
 //INDEX OPENSHIFT//INDEX OPENSHIFT
 //INDEX OPENSHIFT//INDEX OPENSHIFT
 //INDEX OPENSHIFT//INDEX OPENSHIFT
 //INDEX OPENSHIFT//INDEX OPENSHIFT
 //INDEX OPENSHIFT//INDEX OPENSHIFT
 //INDEX OPENSHIFT//INDEX OPENSHIFT
 //INDEX OPENSHIFT//INDEX OPENSHIFT
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
//INDEX OPENSHIFT
var bodyParser = require('body-parser');
var express = require('express');
//var fs = require('fs');
//var https = require('https');
const tbface_log                = "tbface_log";
const tbface_usuario            = "tbface_usuario";
const tbface_page               = "tbface_page";
const tbface_mensaje            = "tbface_mensaje";
const tbface_permiso_face_page  = "tbface_permiso_face_page";
const tbface_attachments        = "tbface_attachments";
const sqlString   =   require('sqlstring');
const conString   =   process.env.ELEPHANTSQL_URL || "postgres://admin:admin@10.30.0.231:5432/db_inscripcion" ;  
var app = express();
var xhub = require('express-x-hub');
var db = require('./modulos/db');
var token =  process.env.TOKEN || '34paler65';
var app_secret =  process.env.APP_SECRET || 'a3e128419aa957f847fc37ee3faca4f1';
var recorrerjson = require('./modulos/recorrerjson');
const pg = require('pg');
var logs = [];
var pages = [];
//var clave = fs.readFileSync('./.well-known/acme-challenge/zZGrLXIUwz4Jze2kGpAsUDW8FIlvn1A5xIiVy2DrSss','utf8')
app.set('port', (process.env.PORT || 5000));
const port = app.get('port');
//const connectionString =  'postgres://admi.n:admin@10.30.0.231:5432/db_inscripcion';
//const conString = 'postgres://waghcyct:VrnvqmW15dYT_403BOoGt8ckvUkWdljU@tantor.db.elephantsql.com:5432/waghcyct';
//
app.listen(app.get('port'), () => {
  appinit = "Aplicacion DEV-FACEBOOK corriendo en puerto: "+ app.get('port');
  logs.unshift(appinit);
  console.log(appinit)
});
app.use(xhub({ algorithm: 'sha1', secret: app_secret}));
app.use(bodyParser.json());

var received_updates = [];

app.get('/promesas', function(req,res){
  let promesa = new Promise(function(ok,error){
    //devulve en caso de que este todo bien
    ok("Todo salio bien");
    //devuelve cuando exisat un error
   //error("Hubo un error");
    return promesa;
  });
  promesa
  .then(dato => {
    return new Promise(function(resolve,error){
      setTimeout(function(){
        res.write(dato);
        return  "Va bien";
      }, 5000);
     

    });
    
  })

  .then(fin2 => {
    res.end(fin2)
      
  })
  .finally(function(){
    res.write('finally')
    
  }
    ).catch(function(error){
    res.end(error)
    
  })
  
});


app.get('/', function(req, res) {
// console.log(req);
  res.write('<pre> process.env.PORT:' + process.env.PORT + '</pre>');
  res.write('<pre> process.env.APP_SECRET:' + process.env.APP_SECRET + '</pre>');
  res.write('<pre> process.env.TOKEN:' + process.env.TOKEN + '</pre>');
  res.write('<pre>process.env.ELEPHANTSQL_URL:' + process.env.ELEPHANTSQL_URL + '</pre>');
  
  res.write('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
  res.end('<pre>' + JSON.stringify(logs, null, 2) + '</pre>');
  
});

app.get('/facebook', function(req, res) {   
  logs.unshift("NUEVO GET /Facebook");
  
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == token
  ) {
    logs.unshift("TOKEN VERIFICADO");
    res.send(req.param('hub.challenge'));
  } else {
    logs.unshift("TOKEN INCORRECTO");
    res.sendStatus(400)
  }

});
app.get('/reset', function(req, res) {   

  
  logs = [];
  Received_updates = [];
  res.write("log Y json reseteados");
  res.end();

}); 

app.post('/facebook', function(req, res) {

   logs.unshift("NUEVO POST /facebook");
  req.body ={
    "object": "page",
    "entry": [
      {
        "id": "159709944504329",
        "time": 1530822744284,
        "messaging": [
          {
            "sender": {
              "id": "1475559052473293"
            },
            "recipient": {
              "id": "159709944504329"
            },
            "timestamp": 1530822744046,
            "message": {
              "mid": "PEYG_Xv4SFROfufFejtnSI6YZM1p8gWrrpUaRBsxRqK7XUwY8HcrLgvhoK2wIqK2PQprwsYzCjcCcB6hGRyKPA",
              "seq": 231,
              "text": "npm start"
            }
          }
        ]
      }
    ]   
  };  
   
/*
  if (!req.isXHubValid()) {
    
    errorxhub = "WAdvertencia: el encabezado de solicitud X-Hub-Signature no está presente o no es válido";
    logs.unshift(errorxhub);
    
    //res.sendStatus(401);
    //return;
  }else{
    logs.unshift("Encabezado de solicitud X-Hub-Signature validado");
  }
*/
received_updates.unshift(req.body);
var client;
let promesa = new Promise (function(resuelta , rechazada){

   client = new pg.Client({
             connectionString: conString,
          });

          client.connect(function(err){


            if(err) {
            
            received_updates.unshift({"Client.connect() No es posible conectar con postgres " : err});
            console.log("------------PASO 0 ---------ERROR AL CONECTAR BD");
            rechazada(err) ;

            }else {

              received_updates.unshift({"Client.connect() Conectado con postgres " : "OK"});
              console.log("------------PASO 0 ------------ CONECTAR BD");
              resuelta(req.body);
              }


            });
  
  

});
promesa
.then(json => {
     return new Promise(function(resolve, reject){
          
        var funcion_retorno =  function retorno(devolucion, accion, sql){
            return new Promise((res,rej) => {
                console.log(devolucion);
              received_updates.unshift(devolucion);
              switch(accion){
                case "ignorar" :
                  res(); 
                break;
                case "abortar" : 
                      received_updates.unshift("Se detiene el proceso de insercion en la BD");
                      rej("Se detiene el proceso de insercion en la BD");
                      throw "error BDDD";
                break;
                case "consultar_usuario" : 
                      console.log("------------PASO 2--- VERIFICAR EXISTENCIA USUARIO", sql)
                      var psid_usuario = sql;
                      db.consultar_usuario(psid_usuario, 
                        function(valor, existencia){
                            received_updates.unshift(valor);
                            switch(existencia){
                              case 'existe':
                                
                                  received_updates.unshift({"Usuario" : "Existe"});
                              break;
                              case 'no-existe':
                              
                                  received_updates.unshift({"Usuario" : "No existe"});
                              break;
                              default:
                            }
                          
                          },client)
                      .then(user_exist => {
                        
                        
                        res(user_exist)

                      })
                      .catch(user_noexis => {
                        console.log("Catch: User noe xist")
                        
                        rej(user_noexis)

                      });
                break;
                  case "insertar" : 
                    json_final = sql;
                   db.insertarJSON(json_final, 
                        function(valor){
                            received_updates.unshift(valor); 
                          }, 
                          client)
                      .then((exito) => {
                        console.log("json_final instertado en la base");
                        res("isnertado");
                      })
                      .catch((bad)=> {
                        console.log("Reject db.insertarJSON")
                        rej(bad)
                      });
                      
                      
                break;
                default:
                }
    

            })
          }

          recorrerjson.indentificarJSON(json, funcion_retorno)
      .then(json_final=>{
        console.log("--------------paso 7")

                  console.log("Json Final: ",json_final)
                  resolve("ok");
                })
      .catch(rejej => {
        console.log("Reject recorrerjson.indentificarJSON()")
        //console.log("ejejejjejeje",rejej)
        reject(rejej);
      });
  });


})
.then(terminar => {
  console.log("--------------paso 8---THEN")
  
  client.end(function(errorbd){
    if(errorbd){console.log("Desconcetado BD Error: ",err); return
  }else{

  console.log("BD desconectada exitosamente");
  }
  })
  res.sendStatus(200);

  
})
.catch((err)=>{

  console.log("--------------paso 8--CATCH")

  client.end(function(errorbd){
     if(errorbd){console.log("Desconcetado BD Error: ",err); return
  }else{
    
  console.log("BD desconectada exitosamente");
}
  })
  console.log("El error es el siguiente: ")
  console.log(err)
  res.sendStatus(200);

});
   
   
});





app.listen();

