###################################################
## Aplicacion: webhook facebook 
## Fecha     : 23/07/2018
## Autor     : Javier Escalona <gescal1@palermo.edu>
##             Ricardo Zito <rzito@palermo.edu>
###################################################



Instalacion
-----------
>Abrir puerto en iptables-config: -A INPUT -m state --state NEW -m tcp -p tcp --dport 5000 -j ACCEPT
```bash
> vim /etc/sysconfig/iptables-config 
$
```
```bash
> git clone https://gitlab.com/JavierBrank1/dev-fb.git
> cd dev-fb/
$
```

```bash
> npm i -S
> npm start
$
```



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



