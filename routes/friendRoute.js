/**
 * Created by chenwen on 14-9-24.
 */
var express = require('express');
var router = express.Router();
var utils = require("../util/utils");
var requestUtils = require("../util/requestUtils");
var log = require("../util/logger.js");
var Code = require("../config/Code.js");
var SystemConfig = require("../config/SystemConfig");
var friendService = require("./services/friendService");
var localtionService = require("./services/locationService");
var handlerApplyService = require("./services/handlerApplyService");
var FriendApply = require("./domain/FriendApply");
var auth = require("./auth/auth");


router.use("*",auth.authLogin);

router.get("/search",auth.friendAuth(["applyName"]), searchUser);  //搜索用户

router.post("/request",auth.friendAuth(["applyName","type"]),addRequest); //添加申请

router.get("/request/list",auth.friendAuth(),getAddRequestList); //获取未处理申请列表

router.post("/handler",auth.friendAuth(["applyName","type","state"]),handlerRequest); //处理请求

router.get("/handler/list",auth.friendAuth(),handlerList); //获取处理结果

router.get("/list",auth.friendAuth(),frindList);   //获取好友列表

router.post("/delete", auth.friendAuth(["delName"]),removeFriend);  //删除好友

router.post("/location/position", auth.friendAuth(["position","id","applyName"]),updatePosition); //更新地理位置

router.post("/location/disconnect",auth.friendAuth(["id"]),disconnect); //断开连接

router.post("/message",auth.friendAuth(["applyName","msg"]), sendMessage); //发送消息

router.get("/message/list",auth.friendAuth(),messageList); //获取消息列表

/**
 * 搜索用户
 * @param req
 * @param res
 * @param next
 */
function searchUser(req, res,next){
    var username = req.session.user.u;
    var applyName = req.query.applyName
    friendService.search(username, applyName,function(err, user){
        if(err){
            log.error(username+"搜索用户:"+applyName+"失败:"+err.stack);
            return requestUtils.send(res, Code.SYSTEM_ERROR);
        }
        if(!user){
            return requestUtils.send(res, Code.USERS.USERNAME_NOT_EXISTS)
        }
        requestUtils.send(res,Code.OK,{user:user})
    });
}
/**
 * 添加好友申请
 * @param req
 * @param res
 * @param next
 */
function addRequest(req, res, next){
    var username = req.session.user.u;
    friendService.addRequest(username, req.body,function(err,code){
        if(err){
            log.error(username+"请求添加"+req.body.applyName+"为好友失败:"+err.stack);
            return requestUtils.send(res, Code.SYSTEM_ERROR);
        }
        requestUtils.send(res, code);
    });
}
/**
 *获取添加好友申请列表(未处理)
 * @param req
 * @param res
 * @param next
 */
function getAddRequestList(req, res, next){
    var username = req.session.user.u;
    friendService.getRequestList(username, req.query, function(err, page){
        if(err){
            log.error(username+"获取好友申请添加列表失败:"+err.stack);
            return requestUtils.send(res, Code.SYSTEM_ERROR);
        }
        requestUtils.send(res, Code.OK, {page:page});
    });
}
/**
 *处理请求
 * @param req
 * @param res
 * @param next
 */
function handlerRequest(req, res, next){
    var username = req.session.user.u;
    var type = req.body.type;
    if(type == FriendApply.TYPE.ADD){
        friendService.handlerAddRequest(username,req.body,function(err,code){
            if(err){
                log.error(username+"处理:"+req.body.applyName+"添加为好友失败"+err.stack);
                return requestUtils.send(res,Code.SYSTEM_ERROR);
            }
            requestUtils.send(res,code);
        });
    }else if(type == FriendApply.TYPE.LOCATION){
        friendService.handlerLocationRequest(username,req.body,function(err,code,id){
            if(err){
                log.error(username+"处理:"+req.body.applyName+"添加为好友失败"+err.stack);
                return requestUtils.send(res,Code.SYSTEM_ERROR);
            }
            requestUtils.send(res,code,{locationId:id});
        });
    }else{
        res.send("type值目前只能是1或者2");
    }
}
/**
 *获取处理结果列表
 * @param req
 * @param res
 * @param next
 */
function handlerList(req, res, next){
    try {
        var username = req.session.user.u;
        handlerApplyService.handlerList(username, function (err, content) {
            if (err) {
                log.error(username + "获取处理结果列表失败:" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR);
            }
            requestUtils.send(res, Code.OK, {content: content});
        })
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.error:"+err.stack);
    }
}
/**
 *发送定位请求
 * @param req
 * @param res
 * @param next
 */
function sendLocationRequest(req, res, next){
    try {
        var username = req.session.user.u;
        localtionService.addRequest(username, req.body, function (err) {
            if (err) {
                log.error(username + "向" + req.body.applyName + "发送定位请求失败:" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR)
            }
            requestUtils.send(res, Code.OK);
        })
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.sendLocationRequest:"+err.stack);
    }
}
/**
 *发送定位请求
 * @param req
 * @param res
 * @param next
 */
function frindList(req, res, next){
    try {
        var username = req.session.user.u;
        friendService.friendList(username, req.query, function (err, page) {
            if (err) {
                log.error(username + "获取好友列表失败:" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR);
            }
            requestUtils.send(res, Code.OK, {page: page});
        });
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.frindList:"+err.stack);
    }
}

/**
 *删除好友
 * @param req
 * @param res
 * @param next
 */
function removeFriend(req, res, next){
    try {
        var username = req.session.user.u;
        var delName = req.body.delName;
        friendService.delete(username, delName, function (err, code) {
            if (err) {
                log.error(username + "删除好友:" + delName + "失败" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR);
            }
            requestUtils.send(res, code);
        });
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.removeFriend:"+err.stack);
    }
}
/**
 *更新地理位置
 * @param req
 * @param res
 * @param next
 */
function updatePosition(req, res, next){
    try {
        var username = req.session.user.u;
        localtionService.updatePosition(username, req.body, function (err, code, data) {
            if (err) {
                log.error(username + "更新地理位置失败:" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR);
            }
            requestUtils.send(res, code, data);
        });
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.updatePosition:"+err.stack);
    }
}
/**
 *获取地理位置
 * @param req
 * @param res
 * @param next
 */
function getPosition(req, res,next){
    try {
        var username = req.session.user.u;
        var id = req.query.id;
        var applyName = req.query.applyName;
        localtionService.getPosition(id, applyName, function (err, position) {
            if (err) {
                log.error(username + "获取好友地理位置失败" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR);
            }
            if (!position) {
                return requestUtils.send(res, Code.CONNECTION.NOT_BUILD);
            }
            requestUtils.send(res, Code.OK, {position: position});
        });
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.getPosition:"+err.stack);
    }
}
/**
 *断开连接
 * @param req
 * @param res
 * @param next
 */
function disconnect(req, res, next){
    try {
        var id = req.body.id;
        localtionService.disconnect(id, function (err, data) {
            if (err) {
                log.error("定位断开连接失败" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR);
            }
            if (data == 0) return requestUtils.send(res, Code.CONNECTION.NOT_BUILD);
            requestUtils.send(res, Code.OK);
        });
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.disconnect:"+err.stack);
    }
}
/**
 * 发送消息
 * @param req
 * @param res
 * @param next
 */
function sendMessage(req, res, next){
    try {
        var username = req.session.user.u;
        var msg = req.body.msg;
        var applyName = req.body.applyName;
        friendService.sendMessage(username, applyName, msg, function (err, code) {
            if (err) {
                log.error("发送消息失败" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR);
            }
            requestUtils.send(res, code);
        });
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.sendMessage:"+err.stack);
    }
}
/**
 * 消息列表
 * @param req
 * @param res
 * @param next
 */
function messageList(req, res, next){
    try {
        var username = req.session.user.u;
        var msg = req.body.msg;
        friendService.messageList(username, function (err, msgList) {
            if (err) {
                log.error("获取消息列表失败:" + err.stack);
                return requestUtils.send(res, Code.SYSTEM_ERROR);
            }
            requestUtils.send(res, Code.OK, {list: msgList});
        });
    }catch(err){
        requestUtils.send(res. Code.SYSTEM_ERROR);
        log.error("friendRouter.messageList:"+err.stack);
    }
}
module.exports = router;
