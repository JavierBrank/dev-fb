/*
			MODULO 
	--------------------------
	---- conf-postgresql -----
	--------------------------
	VARIABLES DE CONFIGURACION 
	para usarlas se debe hacer lo siguiente 

	var confbar = require('conf-postgresql');

	var mi_host = confbar.PGURL;
	

*/
var dblocal 			=	"postgres://admin:admin@10.30.0.231:5432/db_inscripcion";

module.exports.PGURL 		= process.env.ELEPHANTSQL_URL || dblocal;



module.exports = {
  port:  process.env.PORT || 5000,
  env: process.env.ENV || 'development',
  token: process.env.TOKEN || '34paler65',
  app_secret: process.env.APP_SECRET || 'a3e128419aa957f847fc37ee3faca4f1',
  conString: process.env.ELEPHANTSQL_URL || "postgres://admin:admin@10.30.0.231:5432/db_inscripcion",
  //tablas BD
  tbface : {
    log                : 'tbface_log',
    usuario            : "tbface_usuario",
    page               : "tbface_page",
    mensaje            : "tbface_mensaje",
    permiso_face_page  : "tbface_permiso_face_page",
    attachments        : "tbface_attachment"
  },
  // Environment-dependent settings
  development: {
    db: {
      dialect: 'sqlite',
      storage: ':memory:'
    }
  },
  production: {
    db: {
      dialect: 'sqlite',
      storage: 'db/database.sqlite'
    }
  }
};