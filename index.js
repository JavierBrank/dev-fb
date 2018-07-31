'use strict'
const bodyParser                  = require('body-parser');
const express                     = require('express');
const config                    = require('./modulos/conf'); 
var app            = express();
var xhub           = require('express-x-hub');
const funcion      = require('./modulos/funciones');
var db             = require('./modulos/db');
var server         = require('./server');

var addRequestId = require('express-request-id')();
var received_updates = [];

app.listen(config.port, () => {
  console.log("App escuchando http://127.0.0.1:"+config.port+"/");
});
app.use(xhub({ algorithm: 'sha1', secret: config.app_secret}));
app.use(bodyParser.json());
app.use(addRequestId);

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
  console.log("#####################################");
  console.log("######### NUEVO POST FACEBOOK #######");
  console.log("#####################################");
   console.log("#####################################");
  console.log("#"+req.id);
  console.log("#####################################");
  console.log(req.body)
  /*
  if (!req.isXHubValid()) {
    console.log("PETICION NO VALIDA");
    res.sendStatus(401);
    return;
  }
  console.log(req.isXHubValid());
  */
  
  
  
  //console.log(con.nombre_conexion)
  var client ;
  var data_log = {};
  var post_json;  
  
  db.obtenerCliente()
    .then(conexion => { 
      //con  = { key : conexion};
      client = conexion;
      return req.body;
    })
    .then(json=>{
      console.log("###########Validando JSON###########",req.id);
      post_json= json;
      return server.validarJson(post_json, client);
    })
    .then(page_habilitada=>{
      console.log("########Insertando LOG##########",req.id);
      return funcion.insertarLog(post_json, client, data_log);         
    })
    .then(id_log=>{
      console.log("########insertar Json##########",req.id);
      res.sendStatus(200);
      //client.release()
      data_log.id=id_log;
      return server.insertarJson(post_json,client);
    })
    .then(result => {
      console.log("########result##########",req.id);
      data_log.detalle=result;
      data_log.estado=1;
      return funcion.actualizarLog(data_log, client)  
      
    })
    .catch((e)=>{
      console.log("########CATCH##########",req.id);
      console.log(e.message);
      data_log.detalle=JSON.stringify(e.message)+" ->> "+JSON.stringify(e);
      data_log.estado=2;
      if(!data_log.hasOwnProperty('id')){
        res.sendStatus(400);
      }else{
        funcion.actualizarLog(data_log, client);
      }     
    })
    .then(finallys=>{
      console.log("FIN:",req.id)
      if(client) {
        console.log("client.release()")
        client.release();
      } 
    });
});

app.listen();

