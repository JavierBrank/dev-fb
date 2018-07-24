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


app.post('/facebook', function(req, res) { 
  /*
  if (!req.isXHubValid()) {
    errorxhub = "Advertencia: el encabezado de solicitud X-Hub-Signature no está presente o no es válido";
    logs.unshift(errorxhub);
    //res.sendStatus(401);
    //return;
  }else{
    logs.unshift("Encabezado de solicitud X-Hub-Signature validado");
  }
  */
  received_updates.unshift(req.body);
  db.conectarDB()
    .then(conexion => { 
      client = conexion;
      received_updates.unshift({"Conectado DB " : "OK"});
      return req.body
    })
    .then(json => {
      return server.indentificarJSON(json, client)
    })
    .then(json_final=>{
          console.log("--------------paso 7")
          console.log("Final: ",json_final)
          return json_final;
    })
    .then(bd_desconctada => {
      console.log("--PASO 8--TODO SALIÓ OK")
      console.log('DB desconectada')
      res.sendStatus(200);
    })
    .catch((err)=>{
      console.log("--PASO 8- ALGO SALIÓ MAL-")
      console.error(err)
      res.sendStatus(200);
    })
    .finally(function(){
      console.log("--------------paso 7.5--DESCONECTAR")
      return db.desconectarDB(client)    
    })
});

app.listen();

