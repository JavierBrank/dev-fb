'use strict'
const { Pool } = require('pg');
const config                    = require('./conf');
const pool = new Pool(config.poolConf);


module.exports.obtenerCliente = function(){
  return new Promise((resolve, reject)=>{
    pool.connect()
    .then(client=>{
      console.log("Conexiones de clientes abiertas: ",pool.totalCount);
      console.log("Clientes inactivos dentro del grupo: ",pool.idleCount);
      console.log("Solicitudes en cola esperando un cliente: ",pool.waitingCount);
      resolve(client);
    })
    .catch(error=>{
      console.log(error);
      reject(new Error('No se pudo obtenerCliente()'));
    })
    
  });
};


/*
module.exports.conectarDB = function(){
  return new Promise((resolve, reject) => {
    client = new pg.Client({
             connectionString: conString,
          });
          client.connect(function(err){
           if(err) {
            console.log("------------PASO 0 ---------ERROR AL CONECTAR BD");
            reject(err) ;
            }else {
              console.log("------------PASO 0 ------------ CONECTAR BD");
              resolve(client);
            }
      });
  });
};

module.exports.desconectarDB = function(client){
  return new Promise((resolve, reject)=>{
    client.end(function(errorbd){
    if(errorbd){
      console.log("Desconcetado BD Error: ",err); 
      reject(errorbd)
      }else{
        resolve()
      }
    });
  });
}
*/