/**
 * 设备维护者
 * Created by chenwen on 14-10-8.
 */
var conn = require("../database/mongoose.js");
var mongoose = conn.mongo;
var db = conn.db;

var Schema = mongoose.Schema;

var MainTainerSchema = new Schema({
    "mid": Number, //长整 维护者id，
    "email": String, //string 邮件
    "loc": String, //string 所在地
    "mob": String, //string 手机？ 如果有
    "tel": String, //string 座机 如果有
    "name": String //stirng 名称， 公司／个人
});
var MainTainer = db.model("mainTainer",MainTainerSchema);

module.exports = MainTainer;