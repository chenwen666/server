/**
 * 场合
 * Created by chenwen on 14-9-17.
 */
var conn = require("../database/mongoose.js");
var mongoose = conn.mongo;
var db = conn.db;

var Schema = mongoose.Schema;

var SituationSchema = new Schema({
    id : String,
    c : Array,    //楼层所包含得各个建筑物得信息
    f : {},  //整个楼层得信息
    ds : []      //场景设备
});

var Situation = db.model("situation",SituationSchema);


module.exports = Situation;