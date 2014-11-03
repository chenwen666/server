/**
 *
 * Created by chenwen on 14-10-8.
 */
var express = require('express');
var router = express.Router();
var utils = require("../util/utils");
var requestUtils = require("../util/requestUtils");
var log = require("../util/logger");
var Code = require("../config/Code");
var SystemConfig = require("../config/SystemConfig");
var userService = require("./services/userService");
var fs = require("fs");
var async = require("async");
var auth = require("./auth/auth");
var logFilter = require("./filter/logFilter");
var sign = require("./auth/sign");

router.post("/regist",sign({username:true,password:true,timestrap:true,nickName:true,email:false,mobile:false}),regist);

router.post("/email/auth",auth.registAuth(["username","email"]),emailAuth);

router.post("/email/send",sendEmail);

router.use("*",auth.authLogin);

router.post("/nickName",auth.friendAuth(["nickName"]),setNickName);

router.post("/password",auth.friendAuth(["password"]),logFilter.logBefore(logFilter.TYPE.SET_PASSWORD),setPassword);

router.post("/portrait",auth.friendAuth(),setPortrait);


/**
 * 注册
 * @param req
 * @param res
 */
function regist(req, res){
    try {
        var body = req.body;
        userService.regist(body, function (err, code) {
            if (code == Code.SYSTEM_ERROR) {
                log.error(body.username + "注册失败:" + err.stack);
                return requestUtils.send(req, res, Code.SYSTEM_ERROR);
            }
            requestUtils.send(req, res, code);
        })
    }catch(err){
        log.error("userRouter.regist error:"+err.stack);
        requestUtils.send(req,res, Code.SYSTEM_ERROR);
    }
}

/**
 * 修改昵称
 * @param req
 * @param res
 * @param next
 */
function setNickName(req, res, next){
    try {
        var username = req.session.user.u;
        var nickName = req.body.nickName;
        userService.setNickName({username: username, nickName: nickName}, function (err) {
            if (err) {
                log.error(req.session.user.u + "修改昵称失败:" + err.stack);
                return requestUtils.send(req, res, Code.SYSTEM_ERROR)
            }
            requestUtils.send(req, res, Code.OK);
        });
    }catch(err){
        log.error("userRouter.setnickName error:"+err.stack);
        requestUtils.send(req, res, Code.SYSTEM_ERROR);
    }
}

/**
 * 修改密码
 * @param req
 * @param res
 * @param next
 */
function setPassword(req, res, next){
    try {
        var username = req.session.user.u;
        var password = req.body.password;
        userService.setPassword({username: username, password: password}, function (err) {
            if (err) {
                log.error(req.session.user.u + "修改密码失败:" + err.stack);
                return requestUtils.send(req, res, Code.SYSTEM_ERROR)
            }
            requestUtils.send(req, res, Code.OK);
        });
    }catch (err){
        log.error("userRouter.setPassword error:"+err.stack);
        requestUtils.send(req,res, Code.SYSTEM_ERROR);
    }
}
/**
 * 邮箱验证
 * @param req
 * @param res
 * @param next
 */
function emailAuth(req, res, next){

}
/**
 * 发送邮件
 * @param req
 * @param res
 * @param next
 */
function sendEmail(req, res, next){
    try {
        var username = req.body.username;
        userService.sendEmail(username, function (err, code) {
            if (err) {
                log.error(req.session.user.u + "发送邮件失败:" + err.stack);
                return requestUtils.send(req, res, Code.SYSTEM_ERROR)
            }
            requestUtils.send(req, res, code)
        });
    }catch(err){
        log.error("userRouter.sendEmail error:"+err.stack);
        requestUtils.send(req,res, Code.SYSTEM_ERROR);
    }
}
/**
 * 更改头像
 * @param req
 * @param res
 * @param next
 */
function setPortrait(req, res, next){
    try {
        var username = req.session.user.u;
        var tmpPath = req.files.file.path;
        var suffix = req.files.file.name.replace(/([^\.]+)/, function (reg) {
            return username;
        });
        var targetPath = 'public/images/' + suffix;
        async.waterfall([function (callback) {
            fs.rename(tmpPath, targetPath, function (err) {
                callback(err);
            });
        }, function (callback) {
            userService.setPortrait(username, "/images/" + suffix, callback);
        }], function (err) {
            if (err) {
                log.error(req.session.user.u + "设置头像失败:" + err.stack);
                return requestUtils.send(req, res, Code.SYSTEM_ERROR);
            }
            requestUtils.send(req, res, Code.OK);
        })
    }catch(err){
        log.error("userRouter.setPortrait error:"+err.stack);
        requestUtils.send(req, res, Code.SYSTEM_ERROR);
    }
}
module.exports = router;