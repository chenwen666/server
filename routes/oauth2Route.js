var express = require('express');
var router = express.Router();
var utils = require("../util/utils");
var requestUtils = require("../util/requestUtils");
var log = require("../util/logger.js");
var Code = require("../config/Code.js");
var SystemConfig = require("../config/SystemConfig");
var userService = require("./services/userService");
var auth = require("./auth/auth");
var logFilter = require("./auth/logFilter");
var sign = require("./auth/sign");
/* GET users listing. */

router.post("/login",before({username:true,password:true,timestrap:true,redirectURL:false,scope:false}),logFilter.logBefore(logFilter.TYPE.LOGIN),login);

router.post("/token",createToken);

function before(args){
    return function(req, res ,next){
        try{
            var body = req.method =="GET" ? req.query : req.body;
            var msg = utils.validateParameters(body, args);
            if(msg){
                return requestUtils.send(res, Code.MISSING_PARAMTER,msg);
            }
            //验证时间戳
            if(new Date().getTime() - body.timestamp > SystemConfig.SIGN_EXPIRE) return requestUtils.send(res, Code.SIGN_AREADY_OVERDUE);
            //计算签名值
            var sign = requestUtils.getSign(args,body);
            if(sign != body.sign) return requestUtils.send(res, Code.SIGN_ERROR);
            next();
        }catch(e){
            log.error(req.body.username+":"+req.url+'error:'+e.stack);
            requestUtils.send(res,Code.SYSTEM_ERROR);
        }
    }
}
/**
 * 登陆授权
 * @param req
 * @param res
 * @param body
 */
function login(req, res, body){
    try{
        userService.validateUser(req.body, function(err, data){
            if(!!data && data.code == Code.OK){
                var user = data.user;
                req.session.user = {u:req.body.username,p:req.body.password};
                var redirectURL = req.body.redirectURL;
                if(redirectURL){
                    redirectURL += "?token="+data.data.token+"&refreshToken="+data.data.refreshToken;
                    res.redirect(redirectURL);
                }else{
                    requestUtils.send(res, Code.OK, data);
                }
            }else{
                requestUtils.send(res, data.code);
            }
        });
    }catch(e){
        log.error(req.body.username+":"+req.url+'error:'+e.stack);
        requestUtils.send(res,Code.SYSTEM_ERROR);
    }
}

/**
 * 创建token
 * @param req
 * @param res
 * @returns {*}
 */
function createToken(req, res){
    try{
        var msg = utils.validateParameters(req.body,["refreshToken","username"]);
        if(msg) return requestUtils.send(res, Code.MISSING_PARAMTER, msg);
        userService.createToken(req.body,function(err, data){
            if(err) return requestUtils.send(res, Code.SYSTEM_ERROR);
            if(!data.code){
               return  requestUtils.send(res, data);
            }
            req.session.user = {u:req.body.username};
            requestUtils.send(res,data.code,{token:data.token,user:data.user});
        });
    }catch(e){
        log.error(req.body.username+":"+req.url+'error:'+e.stack);
        requestUtils.send(res,Code.SYSTEM_ERROR);
    }
}

module.exports = router;
