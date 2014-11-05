
var AXM = require('./transaction.js').patch();

var redis = require('redis'),
    client = redis.createClient();

var express = require('express');
var app = express();


app.get('/', function(req, res) {
  client.set("stringokey", 'yaya');

  client.get("stringokey", function(err, rep) {
    res.send(202, rep);
  });
});

app.get('/nothing', function(req, res) {
  res.send('yes');
});


app.listen(9006);
