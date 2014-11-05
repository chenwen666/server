
var axm = require('..');
var request = require('request');

function fork() {
  return require('child_process').fork(__dirname + '/transaction/app.mock.js', []);
}

describe('AXM transaction', function() {
  it('should have right properties', function(done) {
    axm.should.have.property('patch');
    axm.should.have.property('http');
    done();
  });

  it('should get query summary on http request', function(done) {
    var app = fork();

    app.on('message', function(data) {
      data.type.should.eql('http:transaction');
      console.log(data);
      process.kill(app.pid);
      done();
    });

    setTimeout(function() {
      request('http://127.0.0.1:9006/', function(req, res) {});
    }, 500);
  });

});
