/*
			MODULO 
	--------------------------
	---- conf-postgresql -----
	--------------------------
	VARIABLES DE CONFIGURACION 
	para usarlas se debe hacer lo siguiente 

	const confbar = require('conf.js');

	var mi_port = confbar.port;
	

*/

module.exports = {
  port:  process.env.PORT || 5000,
  env: process.env.ENV || 'development',
  token: process.env.TOKEN || '34paler65',
  app_secret: process.env.APP_SECRET || 'a3e128419aa957f847fc37ee3faca4f1',
  
  //tablas BD
  tb : {
    persona            : 'tb_persona',
    mail: {
      all              : 'tb_mail_all'
    }
  },
  tbface : {
    log                : 'tbface_log',
    usuario            : "tbface_usuario",
    page               : "tbface_page",
    mensaje            : "tbface_mensaje",
    permiso_face_page  : "tbface_permiso_face_page",
    attachments        : "tbface_attachment"
  },
  poolConf : {
  connectionString: process.env.ELEPHANTSQL_URL || "postgres://admin:admin@10.30.0.231:5432/db_inscripcion",
  // cantidad máxima de clientes que el grupo puede contener
  // por defecto esto está configurado a 10.
  max: process.env.max     || 10,

  // número de milisegundos que un cliente debe permanecer inactivo en la agrupación y no ser desprotegido(cheked out)
  // antes de que se desconecte del back-end y se descarte
  // por defecto es 10000 (10 segundos) - configurado en 0 para deshabilitar la desconexión automática de clientes inactivos
  idleTimeoutMillis: process.env.idleTimeoutMillis             || 10000,

  // número de milisegundos que esperar antes de que se agote el tiempo de espera al conectar un nuevo cliente
  // por defecto esto es 0 lo que significa que no hay tiempo de espera
  connectionTimeoutMillis: process.env.connectionTimeoutMillis || 1000,
  application_name: 'MyUP-CHAT v4.0',
  fallback_application_name: 'MYUP-CHAT-Fallback',



  ssl: false,
  // max milisegundos se ejecutará cualquier consulta que utilice 
  //esta conexión antes de que se agote el tiempo de espera por error. falso = ilimitado
  statement_timeout: false
}

};
