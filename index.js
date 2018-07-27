'use strict'
var bodyParser                  = require('body-parser');
var express                     = require('express');
const config                    = require('./modulos/conf'); 
var app            = express();
var xhub           = require('express-x-hub');
var db             = require('./modulos/db');
var server         = require('./server');
var received_updates = [];
var client;
app.listen(config.port, () => {
  console.log("App escuchando en puerto",config.port);
});
app.use(xhub({ algorithm: 'sha1', secret: config.app_secret}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('<pre>JSON.stringify:' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get('/facebook', function(req, res) {
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == config.token
  ) {
    res.send(req.param('hub.challenge'));
  } else {
    res.sendStatus(400);
  }

});
app.post('/facebook', function(req, res) { 
  received_updates.unshift(req.body);
  /*
  if (!req.isXHubValid()) {
    res.sendStatus(401);
    return;
  }
  */
  db.conectarDB()
    .then(conexion => { 
      client = conexion;
      return req.body;
    })
    .then(json => {
      return server.indentificarJSON(json, client);
    })
    .then(json_final=>{
          console.log("--------------paso 7");
          console.log("Final: ",json_final);
          return json_final;
    })
    .then(bd_desconctada => {
      console.log("--PASO 8--TODO SALIÓ OK");
      res.sendStatus(200);
    })
    .finally(function(){
      console.log("--------finally");
      return db.desconectarDB(client);    
    })
    .catch((error)=>{
      console.log("--PASO 8- ALGO SALIÓ MAL-");
      console.error(error);
      res.sendStatus(200);
    });
});

app.listen();

