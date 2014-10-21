/**
 * 设备
 * Created by chenwen on 14-10-8.
 */
var conn = require("../database/mongoose.js");
var mongoose = conn.mongo;
var db = conn.db;

var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    c : String,
    id : String , //"xx:xx:xx:xx:xx:xx"string 格式类似Mac地址，唯一  设备会post上来
    m: String,//长整 维护者id
    p: String, //长整 所属场景id
    r : Number,
    v: [], //floats 场景中的坐标
    n: Array, //最近的无阻挡设备
    t:{type:String,default:new Date()}, //Date 首次录入时间（精确到秒）
    lt: String, //Date 最后一次更新时间（精确到秒）
    s: Number, //整数 当前状态（可用，故障，暂停..）
    bs: Number //整数 电池状态
});
var Device = db.model("dev",DeviceSchema);



module.exports = Device;