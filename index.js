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
  var key = ["client"+Math.floor((Math.random() * 1000) + 1)];
  var con ={};
  
  console.log(con.nombre_conexion)
  db.conectarDB()
    .then(conexion => { 
      con  = { key : conexion};
      return req.body;
    })
    .then(json => {
      return server.indentificarJSON(json, con.key);
    })
    .then(json_final=>{
          console.log("--------------paso 7");
          console.log("Final: ",json_final);
          return json_final;
    })
    .then(bd_desconctada => {
      console.log("--PASO 8--TODO OK");
      console.log("--------finally");
      bd_desconctada.estado=1;
      db.guardarLog(null, con.key,'update',bd_desconctada)
      .then(fin=>{
        db.desconectarDB(con.key).then(oo=>{console.log("BD DESCONECTADA")}); 
      })
      .catch(final=>{
        db.desconectarDB(con.key).then(oo=>{console.log("Error Con update log->BD DESCONECTADA",oo)});
      })
      res.sendStatus(200);
    })
    .catch((error)=>{
      console.log("--PASO 8- ALGO SALIÓ MAL-");
      console.log(error)
      error.detalle=JSON.stringify(error.error.message);
      error.estado=2;
      db.guardarLog(null, con.key,'update',error)
      .then(fin=>{
        db.desconectarDB(con.key).then(oo=>{console.log("BD DESCONECTADA")}); 
      })
      .catch(final=>{
        db.desconectarDB(con.key).then(oo=>{console.log("Error Con update log->BD DESCONECTADA",final)});
      })
      res.sendStatus(401);
    });
});

app.listen();

