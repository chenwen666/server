/**
 * 用户业务层
 * Created by chenwen on 14-9-11.
 */
var userDao = require("../dao/userDao");
var async = require("async");
var Code = require("../../config/Code");
var emailUtils = require("../../util/emailUtils");
var userService = {};
/**
 * 验证用户名和密码
 * @param username
 * @param password
 * @param cb
 */
userService.validateUser = function(msg, cb){
    var username = msg.username;
    var password = msg.password;
    var expire = msg.expire;
    userDao.validateUser(username, password,expire, cb);
}
/**
 * 创建一个新的token
 * @param msg
 * @param cb
 */
userService.createToken = function(msg, cb){
    var refreshToken = msg.refreshToken;
    var username = msg.username;
    var expires = msg.expire;
    userDao.createToken(username, refreshToken, expires, cb);
}
/**
 * 验证token
 * @param msg
 * @param cb
 */
userService.validateToken = function(msg,cb){
    var username = msg.username;
    var token = msg.token;
    userDao.validateToken(username,token,cb);
}
/**
 * 注册
 * @param msg
 * @param cb
 */
userService.regist = function(msg, cb){
    var password = msg.password;
    var email = msg.email;
    var mobile = msg.mobile;
    var nickName = msg.nickName;
    var gender = msg.gender;
    var birthday = msg.birthday ? new Date(msg.birthday):null;
    var signupDate = new Date();
    var iconHash = msg.iconHash;
    var loc = msg.loc;
    var deviceType = msg.deviceType;
    var opts = {
        u : msg.username,
        p : msg.password,
        em : msg.email,
        m : msg.mobile,
        n : msg.nickName,
        g : msg.gender,
        b : msg.birthday,
        re : new Date(),
        dt : msg.deviceType
    }
    userDao.regist(opts,cb);
}
/**
 * 修改昵称
 * @param msg
 * @param cb
 */
userService.setNickName = function(msg, cb){
    var username = msg.username;
    var nickName = msg.nickName;
    userDao.setNickName(username,nickName,cb);
}

/**
 * 修改密码
 * @param msg
 * @param cb
 */
userService.setPassword = function(msg, cb){
    var username = msg.username;
    var password = msg.password;
    userDao.setPassword(username,password,cb);
}
/**
 * 发送邮件
 * @param username
 * @param cb
 */
userService.sendEmail = function(username, cb){
    async.waterfall([function(callback){
        userDao.get(username, callback);
    },function(user, callback){
        if(!user) return callback(null, Code.USERS.NOT_EXIST);
        var email = user.em;
        if(!email) return callback(null, Code.USERS.EMAIL_NOT_BIND);
        emailUtils.send(email,"用户激活","用户注册激活测试邮件",function(err){
            if(err) return callback(err, null);
            callback(null, Code.OK);
        })
    }],cb)
}
/**
 * 设置头像
 * @param username
 * @param path
 * @param cb
 */
userService.setPortrait = function(username,path,cb){
    userDao.setPortrait(username, path, cb);
}
module.exports = userService;