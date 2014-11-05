
var cls     = require('continuation-local-storage');
var ns      = cls.getNamespace('namespace');

var Proxy     = require('../utils/proxy.js');
var Transport = require('../utils/transport.js');

var HttpWrap = module.exports = function(http) {
  Proxy.wrap(http.Server.prototype, ['on', 'addListener'], function(addListener) {
    return function(event, listener) {

      if (!(event === 'request' && typeof listener === 'function')) return addListener.apply(this, arguments);

      return addListener.call(this, event, function(request, response) {
        var self = this;
        var args = arguments;

        return ns.bind(function() {

          if (ns.active)
            ns.set('transaction', {
              http    : {},
              queries : []
            });

          var http_start = {
            url    : request.url,
            method : request.method,
            start  : Date.now()
          };

          ns.bindEmitter(request);
          ns.bindEmitter(response);

          response.once('finish', function() {

            ns.get('transaction')['http'] = {
              url : http_start.url,
              method : http_start.method,
              time : Date.now() - http_start.start,
              code : response.statusCode
            };

            Transport.send(ns.get('transaction'));
          });

          return listener.apply(self, args);
        })();
      });
    };
  });
  return http;
};
