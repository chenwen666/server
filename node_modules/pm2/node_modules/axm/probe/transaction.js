
var Proxy     = require('proxy.js');
var RedisWrap = require('./wrapper/redis.js');
var HttpWrap  = require('./wrapper/http.js');

var AXM = module.exports = {
  patch : function() {
    var Module = require('module');

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
  }
};
