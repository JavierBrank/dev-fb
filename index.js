'use strict'
var bodyParser                  = require('body-parser');
var express                     = require('express');
const config                    = require('./modulos/conf'); 
var app            = express();
var xhub           = require('express-x-hub');
var db             = require('./modulos/db');
var server         = require('./server');
var received_updates = [];
var data_log = {};
var post_json;  
var client;
app.listen(config.port, () => {
  console.log("App escuchando http://127.0.0.1:"+config.port+"/");
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
  
  //var key = ["client"+Math.floor((Math.random() * 1000) + 1)];
  //var con ={};
  
  //console.log(con.nombre_conexion)
  db.conectarDB()
    .then(conexion => { 
      //con  = { key : conexion};
      client = conexion;
      return req.body;
    })
    .then(json=>{
      post_json= json;
      return server.validarJson(post_json, client);
    })
    .then(page_habilitada=>{
      return db.insertarLog(post_json, client, data_log);         
    })
    .then(id_log=>{
      res.sendStatus(200);
      data_log.id=id_log;
      return server.insertarJson(post_json,client);
    })
    .then(result => {
      console.log("Then utimo")
      data_log.detalle=result;
      data_log.estado=1;
      db.actualizarLog(data_log, client)
      .then(fin=>{
        db.desconectarDB(client).then(oo=>{console.log("BD DESCONECTADA")}); 
      })
      .catch(final=>{
        db.desconectarDB(client).then(oo=>{console.log("Error Con update log->BD DESCONECTADA",oo)});
      })
    })
    .catch((e)=>{
      data_log.detalle=JSON.stringify(e.message)+" ->> "+JSON.stringify(e);
      data_log.estado=2;
      if(!data_log.hasOwnProperty('id')){
        res.sendStatus(400);
        if(client)  db.desconectarDB(client)
      }else{
        db.actualizarLog(data_log, client)  
        .then(fin=>{
          db.desconectarDB(client).then(oo=>{console.log("BD DESCONECTADA")}); 
        })
        .catch(final=>{
          db.desconectarDB(client).then(oo=>{console.log("Error Con update log->BD DESCONECTADA",oo)});
        })
      }     
    });
});

app.listen();

