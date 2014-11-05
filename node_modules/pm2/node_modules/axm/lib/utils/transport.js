
var debug = require('debug')('axm:transport');

var Transport = module.exports = {};

function ipcSend(args) {
  if (!process.send) { return debug('Data will be sent once runned with PM2: %j', args); }

  process.send(args);
};

Transport.send = function(args) {
  ipcSend(args);
};
