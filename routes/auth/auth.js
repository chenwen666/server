/**
 * Created by chenwen on 14-9-17.
 */
var Code = require("../../config/Code");
var requestUtils = require("../../util/requestUtils");
var userService = require("../services/userService");
var log = require("../../util/logger");
var utils = require("../../util/utils");
/**
 * 场景token验证
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports.situationAuth = function(req, res, next){
    var body = req.method =="GET"?req.query : req.body;
    var msg = utils.validateParameters(body,["username","token"]);
    if(msg) return requestUtils.send(res, Code.MISSING_PARAMTER,msg);
    validateTokken(res,body,next);
}
/**
 *好友接口token验证
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports.friendAuth = function(args){
    (args = args || []).push("token")
    return function(req, res, next){
        try{
            var body = req.method =="GET"?req.query : req.body;
            var username = req.session.user.u;
            var msg = utils.validateParameters(body,args);
            if(msg) return requestUtils.send(res, Code.MISSING_PARAMTER,msg);
            body.username = username;
            validateTokken(req, res,body,next);
        }catch(e){
            log.error("auth.frinedAuth.error:"+err.stack);
            requestUtils.send(res, Code.SYSTEM_ERROR);
        }
    }
}
/**
 * 注册验证
 * @param args
 * @returns {Function}
 */
module.exports.registAuth = function(args){
    return function(req, res, next){
        try {
            var body = req.method == "GET" ? req.query : req.body;
            args = args || []
            var msg = utils.validateParameters(body, args);
            if (msg) return requestUtils.send(res, Code.MISSING_PARAMTER, msg);
            var email = body.email;
            var mobile = body.mobile;
            if (!email && !mobile) {
                return requestUtils.send(res, Code.MISSING_PARAMTER, "email mobile必须选择一项");
            }
            next();
        }catch(err){
            log.error("auth.registAuth.error:"+err.stack);
            requestUtils.send(res, Code.SYSTEM_ERROR);
        }
    }
}

/**
 * 检查session
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports.authLogin = function(req, res, next){
    try {
        var user = req.session.user;
        if (!user) return requestUtils.send(res, Code.USERS.NOT_LOGIN);
        next();
    }catch(err){
        log.error("auth.registAuth.authLogin:"+err.stack);
        requestUtils.send(res, Code.SYSTEM_ERROR);
    }
}
/**
 * 验证用户登录或者token
 * @param req
 * @param res
 * @param body
 * @param next
 * @returns {*}
 */
function validateTokken(req, res,body,next){
    try {
        var user = req.session.user;
        if(!user) return requestUtils.send(res, Code.USERS.NOT_LOGIN);
        var username = body.username;
        var token = body.token;
        var flag = new Date().getTime() - user.e > 0
        if(username != user.u || token!=user.t || flag){
           return  requestUtils.send(res, Code.TOKEN.INVALID);
        }
        next();
    }catch(err){
        log.error("auth.registAuth.validateToken:"+err.stack);
        requestUtils.send(res, Code.SYSTEM_ERROR);
    }
}