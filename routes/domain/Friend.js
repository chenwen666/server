/**
 * Created by chenwen on 14-9-23.
 */
 var utils = require("../../util/utils");
var Friend = function(opts){
    if(!!opts){
        this.username = opts.username;
        this.sex = opts.sex;
        this.addTime = opts.addTime;
    }
    return this;
}
/**
 * 从数据库返回值中构建对象
 * @param opts
 */
Friend.prototype.buildFormDb = function(opts){
    if(!!opts){
        this.username = opts.u;
        this.gender = opts.s;
        this.mobile = opts.m;
        this.email = opts.em || opts.e;
        this.nickName = opts.n;
        this.birthday = opts.b;
        this.registTime = opts.re;
        this.iconHash = opts.i;
        this.address = opts.a;
        this.deviceType = opts.dt;
        this.lastOpenTime = opts.lt;
        this.addTime = this.addTime || opts.at;
    }
    return this;
}
module.exports = Friend;