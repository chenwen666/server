/**
 * Created by chenwen on 14-9-17.
 */
var Code = require("../../config/Code");
var requestUtils = require("../../util/requestUtils");
var userService = require("../services/userService");
var utils = require("../../util/utils");
/**
 * 场景token验证
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports.situationAuth = function(req, res, next){
    /*
    var body = req.method =="GET"?req.query : req.body;
    var msg = utils.validateParameters(body,["username","token"]);
    if(msg) return requestUtils.send(res, Code.MISSING_PARAMTER,msg);
    validateTokken(res,body,next);
    */
    next();
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
        /*
        try{
            var body = req.method =="GET"?req.query : req.body;
            var username = req.session.user.u;
            var msg = utils.validateParameters(body,args);
            if(msg) return requestUtils.send(res, Code.MISSING_PARAMTER,msg);
            body.username = username;
            validateTokken(res,body,next);
        }catch(e){
            console.log(e.stack);
        }
        */
        next();
    }
}
/**
 * 注册验证
 * @param args
 * @returns {Function}
 */
module.exports.registAuth = function(args){
    return function(req, res, next){
        /*
        var body = req.method =="GET"?req.query : req.body;
        args = args || []
        var msg = utils.validateParameters(body,args);
        if(msg) return requestUtils.send(res, Code.MISSING_PARAMTER,msg);
        var email = body.email;
        var mobile = body.mobile;
        if(!email && !mobile){
            return requestUtils.send(res,Code.MISSING_PARAMTER,"email mobile必须选择一项");
        }
        next();
        */
        next();
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
    /*
    var user = req.session.user;
//    console.log(req.headers);
    if(!user) return requestUtils.send(res, Code.USERS.NOT_LOGIN);
    */
    req.session.user = {u:"chenwen"};
    next();
}

function validateTokken(res,body,next){
    userService.validateToken(body,function(err, code){
        if(err) return requestUtils.send(res, Code.SYSTEM_ERROR);
        if(code == Code.OK){
            next();
        }else{
            requestUtils.send(res, code);
        }
    });
}