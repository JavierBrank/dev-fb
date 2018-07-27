###################################################
## Aplicacion: webhook facebook 
## Fecha     : 23/07/2018
## Autor     : Javier Escalona <gescal1@palermo.edu>
##             Ricardo Zito <rzito@palermo.edu>
###################################################



Instalacion
-----------
>Abrir puerto en iptables-config: 
```bash
> -A INPUT -m state --state NEW -m tcp -p tcp --dport 5000 -j ACCEPT
$
```

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

>Restart node
```bash
> killall node
> npm start
$
```


Tener en cuenta antes de pasar a producción
--------------------------------------------

```bash
> cd dev-fb/
$
```

Modificar server.js
-------------------

```bash
>  vim server.js
$
```
>Borrar los console.log  que son de debug
>Borrar el array Received_updates = []; en todos lados

Modificar index.js
-------------------

 vim index.js
 *Descomentar la validacion if (!req.isXHubValid()) {..}
 *Borrar el array Received_updates = []; en todos lados 
 *Borrar los console.log  que son de debug
 *Borrar todos los app.get menos => app.get('facebook' y app.post('facebook')
         
##Modificar conf.js
 vim modulos/conf.js  
 *Cambiar las claves de desarrollo por las de producción

##Modificar db.js
 vim modulos/db.js
 *Borrar todos los console.log



