var express = require('express');
var router = express.Router();
var utils = require("../util/utils");
var requestUtils = require("../util/requestUtils");
var log = require("../util/logger.js");
var Code = require("../config/Code.js");
var SystemConfig = require("../config/SystemConfig");
var userService = require("./services/userService");
var auth = require("./auth/auth");
var logFilter = require("./filter/logFilter");
var statFilter = require("./filter/StatFilter");
var User = require("./domain/User");
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
                return requestUtils.send(req, res, Code.MISSING_PARAMTER,msg);
            }
            //验证时间戳
            if(new Date().getTime() - body.timestamp > SystemConfig.SIGN_EXPIRE) return requestUtils.send(req, res, Code.SIGN_AREADY_OVERDUE);
            //计算签名值
            var sign = requestUtils.getSign(args,body);
            if(sign != body.sign) return requestUtils.send(req, res, Code.SIGN_ERROR);
            next();
        }catch(e){
            log.error(req.body.username+":"+req.url+'error:'+e.stack);
            requestUtils.send(req, res,Code.SYSTEM_ERROR);
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
                setSession(req,{u:req.body.username,t:data.token,e:data.expire});
                var redirectURL = req.body.redirectURL;
                if(redirectURL){
                    redirectURL += "?token="+data.token+"&refreshToken="+data.refreshToken;
                    res.redirect(redirectURL);
                }else{
                    requestUtils.send(req, res, Code.OK, data);
                }
                statFilter.add({u:req.body.username,lt : new Date().getTime(),s:User.ON_LINE},function(){});
            }else{
                requestUtils.send(req, res, data.code);
            }
        });
    }catch(e){
        log.error(req.body.username+":"+req.url+'error:'+e.stack);
        requestUtils.send(req, res,Code.SYSTEM_ERROR);
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
        if(msg) return requestUtils.send(req, res, Code.MISSING_PARAMTER, msg);
        userService.createToken(req.body,function(err, data){
            if(err) return requestUtils.send(req, res, Code.SYSTEM_ERROR);
            if(!data.code){
               return  requestUtils.send(req, res, data);
            }
            setSession(req,{u:req.body.username,t:data.token,e:data.expire});
            requestUtils.send(req, res,data.code,{token:data.token,user:data.user});
            statFilter.add({u:req.body.username,lt : new Date().getTime(),s:User.ON_LINE},function(){});
        });
    }catch(e){
        log.error(req.body.username+":"+req.url+'error:'+e.stack);
        requestUtils.send(req, res,Code.SYSTEM_ERROR);
    }
}
function setSession(req, obj){
    req.session.user = obj;
}
module.exports = router;
