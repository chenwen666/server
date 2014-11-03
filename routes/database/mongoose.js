/**
 * Created by chenwen on 14-9-10.
 */
var logger = require("../../util/logger");
var SystemConfig = require("../../config/SystemConfig.js");
var mongo = require('mongoose');
var db = mongo.createConnection(SystemConfig.MONGOOSE_HOST, SystemConfig.MONGOOSE_DATABASE);

db.on("error",function(err){
    logger.error("连接mongodb数据库失败:"+err.stack);
});

db.once("open", function(){
    logger.info("mongodb已连接");
});

module.exports.db = db;
module.exports.mongo = mongo;