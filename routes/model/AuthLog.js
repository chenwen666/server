/**
 * 登录/鉴权日志
 * Created by chenwen on 14-10-8.
 */
var conn = require("../database/mongoose.js");
var mongoose = conn.mongo;
var db = conn.db;

var Schema = mongoose.Schema;

var AuthLogSchema = new Schema({
    "u": String, //string 用户名
    "a": Number, //整数 动作类型
    "t": String //Timestamp 执行时间（精确到秒）
});
var MainTainer = db.model("authLog",AuthLogSchema);

module.exports = MainTainer;
