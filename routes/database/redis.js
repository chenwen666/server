/**
 * Created by chenwen on 14-9-11.
 */
var redis = require("redis");
var dbClient = redis.createClient(6379,"127.0.0.1");
module.exports = dbClient;