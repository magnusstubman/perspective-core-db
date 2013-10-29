var rethinkdb = require('rethinkdb');
var Q = require('q');
var apiLogger = require('./logger');
var NotFoundError = require('perspective-core-server').error.NotFoundError;
var _ = require('underscore');

var _connection = null;

var _registerTable = function(tableName) {
  rethinkdb.tableCreate(tableName).run(_connection, function(err, res) {
    if (res && res.created === 1) {
      apiLogger.info("Table created: " + tableName);
    }
  });
};

var _insert = function(tableName, object) {
  var deferred = Q.defer();

  rethinkdb.table(tableName).insert(object.attr).run(_connection, function(err, result) {
    if (err) {
      apiLogger.error(err);
      deferred.reject(err);
      return;
    }

    var keys = result.generated_keys;
    if (keys.length === 1) {
      object.attr.id = keys.pop();
      deferred.resolve(object);
      return;
    }

    throw new Error("Something is wrong, I should not be here!");
  });

  return deferred.promise;
};

var _get = function(tableName, Clazz, id) {
  var deferred = Q.defer();

  if (id) {
    rethinkdb.table(tableName).get(id).run(_connection, function(err, result) {
      if (err) {
        apiLogger.error(err);
        deferred.reject(err);
        return;
      }

      if (!result) {
        deferred.reject(new NotFoundError("Could not find " + tableName + " with id: " + id));
        return;
      }

      deferred.resolve(new Clazz(result));

    });
  } else {
    rethinkdb.table(tableName).run(_connection, createStandardArrayCallback(Clazz, deferred));
  }

  return deferred.promise;
};

var _update = function(tableName, Clazz, object) {
  var deferred = Q.defer();

  rethinkdb.table(tableName).get(object.attr.id).update(object.attr).run(_connection, function(err, result) {
    if (err) {
      apiLogger.error(err);
      deferred.reject(err);
    }

    deferred.resolve(object);
  });

  return deferred.promise;
};

var _delete = function(tableName, Clazz, id) {
  var deferred = Q.defer();

  rethinkdb.table(tableName).get(id).delete().run(_connection, function(err, result) {
    if (err) {
      apiLogger.error(err);
      deferred.reject(err);
    }

    deferred.resolve(result);
  });

  return deferred.promise;
};

function createStandardArrayCallback(Clazz, deferred) {
  return function(error, cursor) {
    if (error) {
      apiLogger.error(err);
      deferred.reject(err);
      return;
    }

    cursor.toArray(function(err, results) {

      if (err) {
        apiLogger.error(err);
        deferred.reject(err);
        return;
      }

      var objects = _.map(results, function(dbObject) {
        return new Clazz(dbObject);
      });

      deferred.resolve(objects);
    });
  }
}

var generateAPI = function() {
  return function createRepository(tableName, Clazz) {
    _registerTable(tableName);

    return {
      table: function() {
        return rethinkdb.table(tableName);
      },
      connection: _connection,
      insert: function(object) {
        return _insert(tableName, object);
      },
      get: function(id) {
        return _get(tableName, Clazz, id);
      },
      delete: function(id) {
        return _delete(tableName, Clazz, id);
      },
      update: function(object) {
        return _update(tableName, Clazz, object);
      },
      all: function() {
        return _get(tableName, Clazz);
      },
      createStandardArrayCallback: function(deferred) {
        return createStandardArrayCallback(Clazz, deferred);
      }
    }
  }
};

module.exports = function(config) {
  var deferred = Q.defer();
  var _failedTimes = 0;

  var connect = function(callback) {
    rethinkdb.connect({ host: config.host, port: config.port }, callback);
  };

  var connectionCallback = function(err, connection) {
    if (err) {

      if (_failedTimes != 10) {
        _failedTimes++;
        apiLogger.error("Failed to connect to database for the " + _failedTimes + " time, will retry in 10s");
        setTimeout(function() {
          connect(connectionCallback);
        }, 10000);
        return;
      }

      deferred.reject(err);
      return;
    }

    apiLogger.info("Database connection established");
    _connection = connection;

    var dbName = config.dbName;
    rethinkdb.dbCreate(dbName).run(_connection, function(err, res) {
      if (res && res.created === 1) {
        apiLogger.info("Database created: " + dbName);
      }
    });

    _connection.use(dbName);

    deferred.resolve(generateAPI());
  };

  connect(connectionCallback);

  return deferred.promise;
};