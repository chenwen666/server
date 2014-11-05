
var cls     = require('continuation-local-storage');
var ns      = cls.getNamespace('namespace');

var Proxy   = require('../utils/proxy.js');

var RedisWrap = module.exports = function(redis) {
  Proxy.wrap(redis.RedisClient.prototype, 'send_command', function(send_command) {
    return function() {
      return ns.bind(function() {

        var fn_args = arguments[arguments.length - 1];
        var cb = fn_args[fn_args.length - 1];

        var node_transaction = [{
          type : 'redis:query',
          start : Date.now()
        }];

        function end() {
          if (ns.get('transaction')) {
            node_transaction.push({
              type : 'redis:end',
              start : Date.now()
            });
            ns.get('transaction')['queries'].push(node_transaction);
          }
        }

        if (typeof cb === 'function')
          cb = end(cb);
        else
          end();

        send_command.apply(this, arguments);

      }, ns.createContext()).apply(this, arguments);
    };
  });
  return redis;
};
