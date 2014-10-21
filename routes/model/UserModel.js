/**
 * Created by chenwen on 14-9-10.
 */

var conn = require("../database/mongoose.js");
var mongoose = conn.mongo;
var db = conn.db;

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    u : String,   //用户名
    p : String,   //密码
    g : Number,   //性别
    b : String,     //生日
    im : String, //头像
    n : String,   //昵称
    m : String,  //手机
    em : String, //邮箱
    a : String, //地址
    re : String, //注册时间
    rt : String,   //更新token
    t : {},          //token
    lt : String,     //最后更新时间
    f : [],         //好友列表
    l : [],        //申请列表
    h : [],        //处理结果列表
    dt : String,  //设备类型
    ms : [],       //消息列表
    ia :{type:Boolean,default:false} //是否激活
});

var User = db.model("user",UserSchema);

module.exports = User;