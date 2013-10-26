var validation = require("perspective-core").validation;

module.exports = function(env) {
	var config =  {
		host: env.DB_HOST,
		port: env.DB_PORT,
		dbName: env.DATABASE_NAME
	};

	var validationRules = {
		host: {
			required: true
		},
		port: {
			required: true
		},
		dbName: {
			required: true
		}
	};

	var validationErrrors = validation(config, validationRules);

	if (validationErrrors) {
		console.error("Missing database config");
		console.error(validationErrrors);
		process.exit(1);
	}

	return config;
}