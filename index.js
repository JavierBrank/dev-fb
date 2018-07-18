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
var bodyParser                  = require('body-parser');
var express                     = require('express');
const config                    = require('./modulos/conf'); 
const token                     = config.token;
const app_secret                = config.app_secret; 
const port                      = config.port;
var app            = express();
var xhub           = require('express-x-hub');
var db             = require('./modulos/db');
var server         = require('./server');
var logs           = [];
var pages          = [];
var client;
//var clave = fs.readFileSync('./.well-known/acme-challenge/zZGrLXIUwz4Jze2kGpAsUDW8FIlvn1A5xIiVy2DrSss','utf8')
//const connectionString =  'postgres://admi.n:admin@10.30.0.231:5432/db_inscripcion';
//const conString = 'postgres://waghcyct:VrnvqmW15dYT_403BOoGt8ckvUkWdljU@tantor.db.elephantsql.com:5432/waghcyct';
//
app.listen(port, () => {
  appinit = "Aplicacion DEV-FACEBOOK corriendo en puerto: "+ port;
  logs.unshift(appinit);
  console.log(appinit)
});
app.use(xhub({ algorithm: 'sha1', secret: app_secret}));
app.use(bodyParser.json());

var received_updates = [];

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

app.get('/rb', function(req, res) { 
db.conectarDB()
.then(clients => {
  client =clients;
  return db.resetDB(client)
})
.then(ook=>{
  res.write("BD reseteadas", ook);
  db.desconectarDB(client)
  res.end();

})
.catch(error_rb=>{
  res.write(error_rb);
  db.desconectarDB(client)
  res.end();  
  });
}); 


app.post('/facebook', function(req, res) {
  logs.unshift("NUEVO POST /facebook");
  /*req.body =   {
    "object": "page",
    "entry": [
      {
        "id": "159709944504329",
        "time": 1531943971010,
        "messaging": [
          {
            "sender": {
              "id": "1881196298614059"
            },
            "recipient": {
              "id": "159709944504329"
            },
            "timestamp": 1531943970906,
            "message": {
              "mid": "fSYcNZEkq7iq6cFUmQLzVStbPz3Mkp-ies9cRyMZJpET6o-sFZy0qhpHvvWsIEa_a3ECRSdlJx0U2SWR64jBPw",
              "seq": 73284,
              "attachments": [
                {
                  "type": "image",
                  "payload": {
                    "url": "https://scontent.xx.fbcdn.net/v/t1.15752-9/37389962_10216439906374020_1830003041323974656_n.png?_nc_cat=0&_nc_ad=z-m&_nc_cid=0&oh=f82a916c7ccade4bd6a803fd904466b0&oe=5BD89BFE"
                  }
                },
                {
                  "type": "image",
                  "payload": {
                    "url": "https://scontent.xx.fbcdn.net/v/t1.15752-9/37353535_10216439906294018_6742387335121338368_n.png?_nc_cat=0&_nc_ad=z-m&_nc_cid=0&oh=97eb9708b6263c2a3e48cd4749cd1637&oe=5BD5869F"
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  };  
   */
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
    return db.conectarDB()
    .then(conexion => { 
      received_updates.unshift({"Conectado DB " : "OK"});
      client = conexion;
      resuelta(req.body) 
    })
    .catch(error => {
      received_updates.unshift({"Error Conecntando DB " : error});
      rechazada(error)
    })
  });

  promesa
  .then(json => {
    var funcion_retorno =  function(devolucion, accion, sql){
        return new Promise((res,rej) => {
          console.log(devolucion);
          received_updates.unshift(devolucion);
          })
        }
    return new Promise(function(resolve, reject){
      server.indentificarJSON(json, funcion_retorno, client)
      .then(json_final=>{
        console.log("--------------paso 7")
        console.log("Final: ",json_final)
        resolve("ok");
        })
      .catch(rejej => {
        console.log("Reject server.indentificarJSON()")
        //console.log("ejejejjejeje",rejej)
        reject(rejej);
        });

    });
  })
  .then(terminar => {

    console.log("--------------paso 8--THEN")
    db.desconectarDB(client)
    .then(ok => {console.log('DB desconectada')})
    .catch(no_ok => {console.log('Error desconecatndo BD', no_ok)});
    res.sendStatus(200);
  })
  .catch((err)=>{

    console.log("--------------paso 8--CATCH", err)
    db.desconectarDB(client)
    .then(ok => {console.log('DB desconectada')})
    .catch(no_ok => {console.log('Error desconecatndo BD', no_ok)});
    res.sendStatus(200);

  });
   
   
});





app.listen();

