/**
 * Created by chenwen on 14-10-22.
 */
var requestUtils = require("../../util/requestUtils");
var utils = require("../../util/utils");
var SystemConfig = require("../../config/SystemConfig");
var Code = require("../../config/Code");
var log = require("../../util/logger");
module.exports = function(args){
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