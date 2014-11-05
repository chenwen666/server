
var axm = require('axm');

axm.action('submit', { cmt : 'i submit' }, function(reply) {
  reply({ msg : 'my data'});
});
