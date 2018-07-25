'use strict'
var bodyParser                  = require('body-parser');
var express                     = require('express');
const config                    = require('./modulos/conf'); 
var app            = express();
var xhub           = require('express-x-hub');
var db             = require('./modulos/db');
var server         = require('./server');
var client;
app.listen(config.port, () => {
  appinit = "Aplicacion DEV-FACEBOOK corriendo en puerto: "+ config.port;
  console.log(appinit)
});
app.use(xhub({ algorithm: 'sha1', secret: config.app_secret}));
app.use(bodyParser.json());

app.get('/facebook', function(req, res) {
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == config.token
  ) {
    res.send(req.param('hub.challenge'));
  } else {
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
      res.sendStatus(200);
    })
    .finally(function(){
      console.log("--------finally")
      return db.desconectarDB(client)    
    })
    .catch((err)=>{
      console.log("--PASO 8- ALGO SALIÓ MAL-")
      console.error(err)
      res.sendStatus(200);
    })
});

app.listen();

