#Proyect FACEBOOK (Javi)
git clone https://gitlab.com/JavierBrank1/dev-fb.git
cd dev-fb/

npm start
npm i -S 
Modificar port de module.exports
    riki => poner 5050
    javi => poner 5000

#Restart node
killall node;npm start

##############################################
#Tener en cuenta antes de pasar a producción
##############################################
## cd dev-fb/

##Borrar la carpeta public
	rm -fr public/

##Modificar server.js
 vim server.js
 *Revisar nombres de variables. Dejar todas con la misma logica. Ej. guardarLog (la primer letra en minuscula y mayuscula para cada palabra)
 *Borrar los console.log  que son de debug
 *Borrar el array Received_updates = []; en todos lados        

##Modificar index.js
 vim index.js
 *Descomentar la validacion if (!req.isXHubValid()) {..}
 *Revisar nombres de variables. Dejar todas con la misma logica. Ej. guardarLog (la primer letra en minuscula y mayuscula para cada palabra)
 *Borrar el array Received_updates = []; en todos lados        
 *Borrar var logs           = [];
 *Borrar var pages          = [];
 *Eliminar las constantes
   const token                     = config.token;
   const app_secret                = config.app_secret;
   const port                      = config.port;

 *Borrar los console.log  que son de debug
 *Borrar todos los app.get menos => app.get('facebook' y app.post('facebook'
         
##Modificar conf.js
 vim modulos/conf.js  
 *Borrar elementos de module.exports: development y production
 *Cambiar las claves de desarrollo por las de producción
 *Borrar dblocal y module.exports.PGURL
 *Cambiar las claves de desarrollo por las de producción

##Modificar db.js
 vim modulos/db.js
 *Borrar todos los console.log
 *Renombrar module.exports.cargarLOG por module.exports.guardarLog
 *Revisar nombres de variables. Dejar todas con la misma logica. Ej. guardarLog (la primer letra en minuscula y mayuscula para cada palabra)



