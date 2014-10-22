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
Object.defineProperty(FriendApply,"STATE",{
    value : {},
    writable : false,
    configurable : false,
    enumerable : true
})
Object.defineProperties(FriendApply.STATE,{
    NOT_HANDLER : {//未处理
        value : 0,
        writable : false,
        configurable : false,
        enumerable : true
    },
    AGREE : { //同意
        value : 1,
        writable : false,
        configurable : false,
        enumerable : true
    },
    REFUSE : { //拒绝
        value : 2,
        writable : false,
        configurable : false,
        enumerable : true
    },
    LGNORE : { //忽略
        value : 3,
        writable : false,
        configurable : false,
        enumerable : true
    }

})


Object.defineProperty(FriendApply,"TYPE",{
    value : {},
    writable : false,
    configurable : false,
    enumerable : true
})
Object.defineProperties(FriendApply.TYPE,{
    ADD : {//添加好友请求
        value : 1,
        writable : false,
        configurable : false,
        enumerable : true
    },
    LOCATION : { //定位请求
        value : 2,
        writable : false,
        configurable : false,
        enumerable : true
    }
})

module.exports = FriendApply;