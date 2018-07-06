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