/**
 * Created by chenwen on 14-9-10.
 */
var Code = require("../config/Code");
var SystemConfig = require("../config/SystemConfig.js");
var fs = require("fs");
var crypto = require("crypto");
var secret = require('fs').readFileSync("./config/server.key");
var log = require("../util/logger");
//var bcrypt = require("bcrypt");
/**
 * 发送数据(给客户端)
 * @param res
 * @param code
 * @param data
 */
module.exports.send =function(res, code, data){
    if(typeof data == "string"){
        var msg = data;
        data = {};
        data.msg = msg;
    }
    data = data || {};
    data.code = code;
    data.msg = data.msg || getMessage(code);
    log.info(JSON.stringify(data));
    res.send(data);
}
/**
 *
 * @param paramArgs
 * @param msg
 * @returns {string}
 */
module.exports.getSign = function(args, msg){
    var paramArgs = [];
    for(var key in args){
        paramArgs.push(key);
    }
    var signValue = '';
    var index = 0;
    var paramNameAndValueArray = [];
    for(var i = 0,l = paramArgs.length; i<l; i++){
        var msgValue = msg[paramArgs[i]];
        if(msgValue){
            paramNameAndValueArray[index] = paramArgs[i]  + msgValue;
            index++;
        }
    }
    paramNameAndValueArray.sort();
    for(var i= 0,l=paramNameAndValueArray.length; i<l; i++) {
        signValue += paramNameAndValueArray[i];
    }
    //首尾加上秘钥
    signValue = SystemConfig.SECRET + signValue + SystemConfig.SECRET;
    signValue = encodeURIComponent(signValue);

    signValue = crypto.createHash('sha256').update(signValue).digest('hex').toUpperCase();
    return signValue;
}
/**
 * 创建token
 * @returns {*|string|String|toString|toString|toString}
 */
module.exports.generateToken = function(username) {
    var hmac = crypto.createHmac('sha256', secret);
    hmac.update(username+new Date().getTime());
    return hmac.digest("hex");
};
/**
 * 生成随机ID
 * @param username
 */
module.exports.generateId = function(username){
    var sha1 = crypto.createHash('sha1');
    sha1.update(username);
    sha1.update(new Date().getTime()+"");
    return sha1.digest("hex");
}
/**
 * 创建刷新token
 * @param username
 */
module.exports.generateRefreshToken = function(username){
    var hmac = crypto.createHmac('sha256', secret);
    hmac.update(username);
    return hmac.digest("hex");
}
/**
 * 解密token
 * @param token
 */
module.exports.unlockToken = function(token){
    var data = {};
    try{
        var decipher = crypto.createDecipher("aes-256-cbc",secret);
        var dec = decipher.update(token,"hex","utf-8");
        dec += decipher.final("utf-8");
        var words = dec.split(":");
        if(words.length == 3){
            data.username = words[0];
            data.startTime = words[1];
            data.expire = words[2];
        }
        return data;
    }catch(e){
        return data;
    }

}
/**
 * 解密refreshToken
 * @param token
 */
module.exports.unlockRefreshToken = function(token){
    try{
        var decipher = crypto.createDecipher("aes-256-cbc",secret);
        var dec = decipher.update(token,"hex","utf-8");
        dec += decipher.final("utf-8");
        return JSON.parse(dec);
    }catch(e){
        return dec;
    }
}

function getMessage(code){
    switch (code){
        case Code.OK : return "操作成功";
        case Code.SYSTEM_ERROR : return "系统错误";
        case Code.MISSING_PARAMTER : return "缺少参数";
        case Code.SIGN_AREADY_OVERDUE : return "签名已过期";
        case Code.USERS.USERNAME_NOT_EXISTS : return "用户不存在";
        case Code.USERS.PASSWORD_ERROR : return "密码错误";
        case Code.SIGN_ERROR : return "签名错误";
        case Code.USERS.NOT_LOGIN : return "用户未登陆";
        case Code.TOKEN.NOT_EXIST : return "缺少参数token";
        case Code.TOKEN.ALREADY_EXPIRE : return "token已失效";
        case Code.TOKEN.INVALID : return "无效的token";
        case Code.FRIEND.EXIST : return "好友已存在";
        case Code.APPLY.NOT_EXIST : return "请求不存在";
        case Code.APPLY.TARGET_NOT_EXIST : return  "目标不存在";
        case Code.CONNECTION.NOT_BUILD : return "连接未建立";
        case Code.USERS.NOT_EXIST : return "用户不存在";
        case Code.FRIEND.NOT_EXIST : return "好友不存在";
        case Code.USERS.USERNAME_ALREADY_REGIST : return "用户已注册";
        case Code.USERS.EMAIL_EXIST : return "邮箱被占用";
        case Code.USERS.MOBILE_EXIST : return "手机号被占用";
        case Code.USERS.EMAIL_NOT_BIND : return "未绑定邮箱"
        default : return "未知错误";
    }
}