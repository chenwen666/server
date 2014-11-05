
var Proxy     = require('./utils/proxy.js');
// var RedisWrap = require('./wrapper/redis.js');
// var HttpWrap  = require('./wrapper/http.js');
var SimpleHttpWrap  = require('./wrapper/simple_http.js');

var debug = require('debug')('axm:patch');

var Transaction = module.exports = {};

Transaction.patch = function() {
  var Module = require('module');

  debug('Patching');

  Proxy.wrap(Module, '_load', function(load) {
    return function(file) {
      if (file == 'redis') {
        return RedisWrap(load.apply(this, arguments));
      }
      else if (file == 'http') {
        return HttpWrap(load.apply(this, arguments));
      }
      else
        return load.apply(this, arguments);
    };
  });
};

Transaction.http = function() {
  var Module = require('module');

  debug('Patching HTTP routes');

  Proxy.wrap(Module, '_load', function(load) {
    return function(file) {
      if (file == 'http') {
        return SimpleHttpWrap(load.apply(this, arguments));
      }
      else
        return load.apply(this, arguments);
    };
  });
};
