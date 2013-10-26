var error = require('./lib/error');
var db = require('./lib/db');
var produceConfig = require('./lib/config');

module.exports = {
	error: error,
	db: db,
	produceConfig: produceConfig
};