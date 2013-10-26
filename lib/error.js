var util = require('util');
var AbstractError = require('perspective-core-server').error.AbstractError;

var DatabaseError = function (msg) {
  DatabaseError.super_.call(this, msg, this.constructor);
};

util.inherits(DatabaseError, AbstractError);
DatabaseError.prototype.name = 'DatabaseError';

module.exports = {
  DatabaseError: DatabaseError
};