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
var app = express();
var xhub = require('express-x-hub');
var query = require('./modulos/db');
var token =  process.env.TOKEN || '34paler65';
var app_secret =  process.env.APP_SECRET || 'a3e128419aa957f847fc37ee3faca4f1';
var jsonb = require('./modulos/recorrerjson');
var logs = [];
//var clave = fs.readFileSync('./.well-known/acme-challenge/zZGrLXIUwz4Jze2kGpAsUDW8FIlvn1A5xIiVy2DrSss','utf8')
app.set('port', (process.env.PORT || 5000));
const port = app.get('port');
//const connectionString =  'postgres://admin:admin@10.30.0.231:5432/db_inscripcion';
const connectionString = 'postgres://waghcyct:VrnvqmW15dYT_403BOoGt8ckvUkWdljU@tantor.db.elephantsql.com:5432/waghcyct';
//
/*
var options = {
  ca: fs.readFileSync('./.well-known/acme-challenge/ca.csr'),
  key: fs.readFileSync('./.well-known/acme-challenge/key.key'),
  cert: fs.readFileSync('./.well-known/acme-challenge/cert.crt','utf8')
};
https.createServer(options,app).listen(port, ()=>{
  console.log("Servidor https corriendo en puerto: ", port);
});
*/

app.listen(app.get('port'), () => {
  appinit = "Aplicacion DEV-FACEBOOK corriendo en puerto", app.get('port');
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
   logs.unshift("NUEVO POST");
  /*req.body ={
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
  */
  console.log('Facebook request body:', req.body.entry);
  
  if (!req.isXHubValid()) {
    errorxhub = "WAdvertencia: el encabezado de solicitud X-Hub-Signature no está presente o no es válido";
    logs.unshift(errorxhub);
    console.log(errorxhub);
    res.sendStatus(401);
    return;
  }else{
    logs.unshift("Encabezado de solicitud X-Hub-Signature validado");
  }

/*
var client = new Client({
  connectionString: connectionString,
});
client.connect();
var queryInsert = "insert into tbface_log (fecha, json_data ) VALUES (now(),'"+JSON.stringify(req.body, null, 2)+"');";
client.query(queryInsert,
 (err, res) => {
  console.log(err, res);
  client.end();
});

*/
  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here

    received_updates.unshift(req.body)
    valor_de_jsonb = jsonb.indentificarJSON(req.body, function(devolucion){
        console.log(devolucion);
        logs.unshift(devolucion);
    });
    console.log(valor_de_jsonb);
    query.insertarJSON(req.body, function(valor){
      logs.unshift(valor);
    });
   
    res.sendStatus(200);
});



app.listen();
