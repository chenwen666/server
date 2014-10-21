/**
 * Created by chenwen on 14-9-23.
 */
var utils = require("../../util/utils");
var FriendApply = function(opts){
    if(!!opts){
        this.username = opts.username;
        this.applyTime = opts.applyTime;
        this.msg = opts.msg;
        this.type = opts.type;
    }
}
/**
 * 从数据库返回值中构建对象
 * @param opts
 */
FriendApply.prototype.buildFormDb = function(opts){
    if(!!opts){
        this.username = opts.u;
        this.applyTime = opts.t;
        this.msg = opts.m;
        this.type = opts.tp;
    }
    return this;
}
//是否为好友
FriendApply.STATE = {
    NOT_HANDLER : 0, //未处理
    AGREE :1,    //同意
    REFUSE : 2,  //拒绝
    LGNORE : 3   //忽略
}
FriendApply.TYPE = {
    ADD : 1, //添加好友请求
    LOCATION : 2 //定位请求
}
module.exports = FriendApply;