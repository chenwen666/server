/**
 * Created by chenwen on 14-9-11.
 */
var redis = require("redis");
var SystemConfig = require("../../config/SystemConfig");
var dbClient = redis.createClient(SystemConfig.REDIS_PORT, SystemConfig.REDIS_HOST);
module.exports = dbClient;