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
Object.defineProperty(User,"GENDER_VALUE",{
    value : {},
    writable : false,
    configurable : false,
    enumerable : true
})


Object.defineProperties(User.GENDER_VALUE,{
    MAN : {
        value : 0,//man
        writable : false,
        configurable : false,
        enumerable : true
    },
    WOMAN : {
        value : 1, //woman
        writable : false,
        configurable : false,
        enumerable : true
    },
    OTHER : {
        value : 2, //other
        writable : false,
        configurable : false,
        enumerable : true
    }
})
Object.defineProperty(User,"ON_LINE",{ //在线状态
    writable : false,
    value : 1
});
Object.defineProperty(User,"OFF_LINE",{
    writable : true,
    value : 2
})
module.exports = User;