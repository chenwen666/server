/**
 * Created by chenwen on 14-9-23.
 */
var utils = require("../../util/utils");
var User = function(opts){
    if(!!opts){
        this.id = opts.id;
        this.username = opts.username;
        this.sex = opts.sex;
        this.isFriend = false;
    }
    return this;
}
/**
 * 从数据库返回值中构建对象
 * @param opts
 */
User.prototype.buildFormDb = function(opts){
    if(!!opts){
        this.username = opts.u;
        this.gender = opts.s;
        this.mobile = opts.m;
        this.email = opts.em;
        this.iconHash = opts.im;
        this.nickName = opts.n;
//        this.birthday = utils.parseTime(opts.b);
        this.birthday = opts.b;
//        this.registTime = utils.parseTime(opts.re);
        this.address = opts.a;
        this.deviceType = opts.dt;
//        this.lastOpenTime = utils.parseTime(opts.lt);
        this.lastOpenTime = opts.lt;
    }
    return this;
}
//性别
User.GENDER_VALUE = {
    MAN : 0 , //男
    WOMAN : 1, //女
    OTHER : 2  //其他
}
module.exports = User;