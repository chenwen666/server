/**
 * Created by chenwen on 14-10-8.
 */
var AuthLog = require("../model/AuthLog");
var utils = require("../../util/utils");
var requestUtils = require("../../util/requestUtils");
var log = require("../../util/logger");
var Code = require("../../config/Code");

module.exports.logBefore = function(type){

    return function(req, res, next){
        try{
            var body = req.method =="GET" ? req.query : req.body;
            if(!!req.session.user){
                var username = req.session.user.u;
            }
            if(!username) username = body.username;
            var authLog = new AuthLog({
                u : username,
                a : type,
                t : utils.parseTime(new Date())
            });
            authLog.save(function(){});
            next();
        }catch(e){
            log.error("logBefore error:"+ e.stack);
            requestUtils.send(req, res, Code.SYSTEM_ERROR);
        }
    }
}

module.exports.TYPE = {
    LOGIN : 0, //登录
    SET_PASSWORD:1  //修改密码
}