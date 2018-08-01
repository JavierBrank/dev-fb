'use strict'
const bodyParser                  = require('body-parser');
const express                     = require('express');
const config                    = require('./modulos/conf'); 
var app            = express();
var xhub           = require('express-x-hub');
const funcion      = require('./modulos/funciones');
var db             = require('./modulos/db');
var server         = require('./server');
var received_updates = [];

app.listen(config.port, () => {
  console.log("App escuchando en puerto",config.port);
  console.log("Url http://localhost:"+config.port+"/");
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
  console.log("#####################################");
  console.log("######### NUEVO POST FACEBOOK #######");
  console.log("#####################################");
  /*
  if (!req.isXHubValid()) {
    console.log("PETICION NO VALIDA");
    res.sendStatus(401);
    return;
  }
  console.log(req.isXHubValid());
  */
  
  //console.log(con.nombre_conexion)
  
  db.obtenerCliente()
    .then(conexion => { 
      //con  = { key : conexion};
      let dataJson = {
                      dataLog : {},
                      postJson: req.body,
                      client: conexion,
                      jsonFinal: {},
                      jsonPage: {},
                      error: '',
                    };
      return dataJson;
    })
    .then(dataJson=>{
      console.log("###########Validando JSON###########");
      return server.validarJson(dataJson);
    })
    .then(dataJson=>{
      console.log("########Insertando LOG##########");
      return funcion.insertarLog(dataJson);         
    })
    .then(dataJson=>{
      console.log("########insertar Json##########");
      res.sendStatus(200);
      //client.release()
      return server.insertarJson(dataJson);
    })
    .then(result => {
      console.log("########result##########");
      result.dataLog.detalle=result.mensaje;
      result.dataLog.estado=1;
      return funcion.actualizarLog(result)  
    })
    .catch((e)=>{
      console.log("########CATCH##########");
      console.log(e.error);
      e.dataLog.detalle=JSON.stringify(e.error.message)+" ->> "+JSON.stringify(e.error);
      e.dataLog.estado=2;
      if(!e.dataLog.hasOwnProperty('id')){
        res.sendStatus(400);
      }else{
        return funcion.actualizarLog(e.dataLog, e.client, e);
      }     
    })
    .then(finallys=>{
      console.log("FIN:")
      if(finallys.client) {
        console.log("client.release()")
        finallys.client.release();
      } 
    });
});

app.listen();

