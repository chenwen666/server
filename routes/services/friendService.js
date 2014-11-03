/**
 * Created by chenwen on 14-9-24.
 */
var friendDao = require("../dao/friendDao");
var userDao = require("../dao/userDao");
var handlerApplyDao = require("../dao/handlerApplyDao");
var locationDao = require("../dao/locationDao");


var Code = require("../../config/Code.js");
var Page = require("../domain/page");
var FriendApply = require("../domain/FriendApply");
var requestUtils = require("../../util/requestUtils");
var async = require("async");
var friendService = {};
/**
 * 搜索用户
 * @param body
 * @param cb
 */
friendService.search = function(username, applyName,cb){
    friendDao.search(username, applyName, cb);
}
/**
 * 添加好友申请
 * @param username
 * @param msg
 * @param cb
 */
friendService.addRequest = function(username, msg, cb){
    var applyName = msg.applyName;
    var type = +msg.type || FriendApply.TYPE.ADD;
    async.waterfall([function(callback){
        if(type==FriendApply.TYPE.ADD){
            friendDao.search(username,applyName,callback);
        }else{
            userDao.isExist(username,callback);
        }
    },function(user,callback){
        if(!user) return callback(null,Code.USERS.USERNAME_NOT_EXISTS);
        if(type == FriendApply.TYPE.ADD){
            if(user.isFriend)return callback(null, Code.FRIEND.EXIST);
        }
        friendDao.addRequest(username,msg,callback);
    }],function(err,data){
        cb(err, data);
    });
}
/**
 * 获取添加好友申请列表(未处理)
 * @param username
 * @param msg
 * @param cb
 */
friendService.getRequestList = function(username,msg, cb){
    friendDao.getRequestList(username, cb);
}
/**
 * 处理好友添加请求
 * @param username
 * @param msg
 * @param cb
 */
friendService.handlerAddRequest = function(username,msg, cb){
    var applyName = msg.applyName;
    var state = msg.state;
    var type = msg.type;
    async.waterfall([function(callback){
        friendDao.updateFriendAddApply(username,applyName,type, state,callback);
    },function(data, callback){
        if(!data){ //请求不存在
            callback(null,Code.APPLY.NOT_EXIST);
        }else{
            if(state == FriendApply.STATE.AGREE){ //如果是同意了请求
                async.waterfall([function(callback){
                    friendDao.search(username,applyName,callback);
                },function(user, callback){
                    if(!user) callback(null,Code.APPLY.TARGET_NOT_EXIST);
                    async.parallel([function(callback){
                        if(user.isFriend){//如果是好友username通过applyName  那applyName好友里肯定没有username 所以只要单向添加
                            friendDao.add(applyName,username,callback);
                        }else{//双向添加
                            async.parallel([function(callback){
                                friendDao.add(username, applyName,callback);
                            },function(callback){
                                friendDao.add(applyName,username,callback);
                            }],callback)
                        }
                    },function(callback){
                        handlerApplyDao.insert(username,msg,callback); //插入消息
                    }],callback)
                }],function(err){
                    callback(err, Code.OK)
                });
            }else{
                callback(null, Code.OK);
            }
        }
    }],cb);
}
/**
 * 处理定位请求
 * @param username
 * @param msg
 * @param cb
 */
friendService.handlerLocationRequest = function(username, msg,cb){
    var applyName = msg.applyName;
    var state = msg.state;
    var type = msg.type;
    var id = requestUtils.generateId(username);//创建随机ID
    async.waterfall([function(callback){
        friendDao.updateFriendAddApply(username,applyName,type,state,callback);
    },function(data,callback){
        if(!data){ //请求不存在
            callback(null,Code.APPLY.NOT_EXIST);
        }else {
            msg.id = id;
            handlerApplyDao.insert(username,msg,function(err){
                if(err) return callback(err);
                callback(null, Code.OK);
            });
        }
    },function(code,callback){
        if(code !=  Code.OK)return callback(null,code);
        if(state == FriendApply.STATE.AGREE){
            locationDao.createLocationConnection(id,username,applyName,function(err){
                if(err) return cb(err);
                callback(null, Code.OK,id);
            });
        }else{
            callback(null, Code.OK);
        }
    }],cb);
}
/**
 * 删除好友
 * @param username
 * @param msg
 * @param cb
 */
friendService.delete = function(username,applyName, cb){
    friendDao.delete(username,applyName,cb);
}
/**
 * 获取好友列表
 * @param username
 * @param cb
 */
friendService.friendList = function(username,msg, cb){
    friendDao.friendList(username, cb);
}
/**
 * 发送消息
 * @param username
 * @param cb
 */
friendService.sendMessage = function(username,applyName, msg, cb){
    friendDao.sendMessage(username, applyName,msg,  cb);
}
/**
 * 消息列表
 * @param username
 * @param cb
 */
friendService.messageList = function(username, cb){
    friendDao.messageList(username, cb);
}

module.exports = friendService;