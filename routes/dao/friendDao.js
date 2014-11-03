/**
 * Created by chenwen on 14-9-23.
 */
var SystemConfig = require("../../config/SystemConfig");
var UserModel = require("../model/UserModel");
var dbUtils = require("../../util/dbUtils");
var userDao = require("./userDao");
var log = require("../../util/logger.js");
var Friend = require("../domain/Friend");
var User = require("../domain/User");
var FriendApply = require("../domain/FriendApply");
var Code = require("../../config/Code");
var async = require("async");
var redis = require("../database/redis");
var utils = require("../../util/utils");

var friendDao = {};

/**
 * 搜索好友(用户)
 * @param username
 * @param cb
 */
friendDao.search = function(username, searchName, cb){
    var self = this;
    async.waterfall([function(callback){
        userDao.get(searchName,callback);
    },function(data, callback){
        if(!data) return callback(null,null);
        var user = new User();
        user.buildFormDb(data);
        user.username = searchName;
        self.isFriend(username,searchName,function(err, flag){
            if(err) return callback(err);
            user.isFriend = flag;
            callback(null, user);
        });
    }],cb);
}

/**
 * 添加好友申请
 * @param username
 * @param applyModel
 * @param cb
 */
friendDao.addRequest = function(username,msg, cb){
    var applyName = msg.applyName;
    var date = new Date();
    var message = msg.msg;
    var type = +msg.type;
    var data = {
        u : username,
        t : date,
        m : message,
        tp : type
    }
    var conditions = {u:applyName,"l":{"$elemMatch":{"u":username,"tp":type}}};
    async.waterfall([function(callback){
        UserModel.findOne(conditions,{u:1,_id:0},callback);
    },function(apply,callback){
        if(!!apply){ //如果这个存在则修改
            UserModel.update(conditions,{"$set":{"l.$.t":date,"l.$.m":message}},callback);
        }else{
            UserModel.update({u:applyName},{$push:{l:data}},callback);
        }
    }],function(err, data){
        cb(err,Code.OK);
    });
}
/**
 * 获取申请列表
 * @param user
 * @param page
 * @param cb
 */
friendDao.getRequestList = function(username,cb){
    UserModel.findOne({u:username},{l:1,_id:0},function(err,user){
        if(err) return cb(err);
        var list = [];
        if(!!user && !!user.l){
            var array = user.l;
            for(var i= 0,l=array.length;i<l;i++){
                var friendApply = new FriendApply();
                friendApply.buildFormDb(array[i]);
                list.push(friendApply);
            }
        }
        cb(null, list);
    });
}
/**
 * 添加好友
 * @param username username加applyName
 * @param applyName
 * @param type
 * @param cb
 */
friendDao.add = function(username, applyName, cb){
    var date = new Date();
    async.parallel([function(callback){
        //更新rids
        async.waterfall([function(callback){
            redis.hget(username,"f",function(err,result){
                var friendList = [];
                if(!!result) friendList = JSON.parse(result);
                friendList.push({u:applyName,at:date});
                callback(null, friendList);
            });
        },function(friendList, callback){
            redis.hset(username,"f",JSON.stringify(friendList),callback);
        }],callback)
    },function(callback){
        //更新mongodb
        UserModel.update({u:username},{"$push":{"f":{u:applyName,at:date}}},callback);
    }],function(err, values){
        if(err){
            log.error("friendDao.addFriend 添加好友错误:"+err.stack);
        }
        return cb(err);
    });
}
/**
 * 更新请求处理状态(没有请求回调0,有请求回调1)
 * @param username
 * @param applyName
 * @param cb
 */
friendDao.updateFriendAddApply = function(username, applyName,type,state, cb){
    UserModel.findOneAndUpdate({u:username,"l":{"$elemMatch":{"u":applyName,"tp":+type}}},
        {"$pull":{"l":{u:applyName,tp:+type}}},{select:{u:1,_id:0}},cb);
}
/**
 * 删除好友    username删除applyName
 * @param username
 * @param applyName
 * @param cb
 */
friendDao.delete = function(username, applyName, cb){
    async.parallel([function(callback){//从redis中删除
        redis.hget(username,"f",function(err,result){
            if(err) return callback(err);
            var friendList = [];
            if(!!result) friendList = JSON.parse(result);
            for(var i= 0,l=friendList.length;i<l;i++){
                if(!!friendList[i] && friendList[i].u == applyName){
                    friendList = friendList.slice(0,i).concat(friendList.slice(i+1,l));
                    break;
                }
            };
            redis.hset(username,"f",JSON.stringify(friendList));
            callback();
        });
    },function(callback){//从mongoose中删除
        UserModel.update({u:username},{"$pull":{"f":{u:applyName}}},callback);
    }],cb)
}
/**
 * 获取好友列表
 * @param username
 * @param cb
 */
friendDao.friendList = function(username, cb){
    async.waterfall([function(callback){
        redis.hget(username,"f",function(err, fs){
            if(!!fs) fs = JSON.parse(fs);
            callback(err,fs);
        });
    },function(list, callback){
        if(!!list){
            callback(null, list);
        }else{
            UserModel.findOne({u:username},{_id:0,f:1},function(err, user){
                list = [];
                if(!!user && !!user.f) list = user.f;
                callback(err, list);
            })
        }
    },function(friendList, callback){
        var names = [];
        for(var i= 0,l=friendList.length;i<l;i++){
            names.push(friendList[i].u);
        }
        if(names.length>=1){  //如果有好友
            var query = UserModel.find({u:{"$in":names}},{u:1,g:1,b:1,im:1,em:1,a:1,n:1,m:1,lt:1,_id:0});
            query.sort({lt:-1});
            query.exec(function(err,users){
                if(err) callback(err);
                var content = [];
                for(var i= 0,l=users.length;i<l;i++){
                    for(var j= 0,t=friendList.length;j<t;j++){
                        if(friendList[j].u == users[i].u){
                            var friend = new Friend();
                            friend.buildFormDb(friendList[j]);
                            friend.buildFormDb(users[i]);
                            content.push(friend);
                            break;
                        }
                    }
                }
                callback(err, content);
            });
        }else{
            callback(null, []);
        }
    }],cb)
}
/**
 * 判断是不是好友关系
 * @param username
 * @param applyName
 * @param cb
 */
friendDao.isFriend = function(username,applyName,cb){
    async.waterfall([function(callback){
        redis.hget(username,"f",function(err,friendList){
            if(!friendList)return callback(null, 2);
            try{
                friendList = JSON.parse(friendList);
                return callback(null, utils.isExistOfArray(friendList, "u", applyName));
            }catch(e){//如果发生错误重新从mongodb中加载
                log.info("friendDao.isFriend error:"+ e.stack);
                return callback(null,false);
            }
        });
    },function(isFriend, callback){
        if(isFriend !=2) return callback(null, isFriend);
        UserModel.findOne({u:username},{_id:0,f:1},function(err,user){
            if(err) return callback(err,false);
            if(!user || !user.f) return callback(null, false);
            var friendList = user.f;
            if(!!friendList){
                var flag = utils.isExistOfArray(friendList,"u", applyName);
                if(flag){
                    return callback(null, true);
                }
            }
            return callback(null, false);
        });
    }],cb)
}
/**
 * 发送消息
 * @param username
 * @param applyName
 * @param cb
 */
friendDao.sendMessage = function(username, applyName,msg, cb){
    async.waterfall([function(callback){
        redis.exists(applyName,callback);
    },function(exist, callback){
        if(exist){
            callback(null, true);
        }else{
            UserModel.findOne({u:applyName},{u:1},callback);
        }
    },function(flag, callback){
        if(!flag) return callback(null, Code.USERS.NOT_EXIST);
        var date = new Date();
        var opts = {
            u : username,
            t : date,
            m : msg
        }
        UserModel.update({u:applyName},{"$push":{"ms":opts}},function(err){
            if(err) return callback(err, null);
            callback(null, Code.OK);
        });
    }],cb)
}
/**
 * 获取消息列表
 * @param username
 * @param cb
 */
friendDao.messageList = function(username, cb){
    async.series([function(callback){
        UserModel.findOne({u:username},"ms",function(err,user){
            if(err) return cb(err);
            var msgList = [];
            if(!!user){
                var array = user.ms;
                if(!!array){
                    for(var i = 0,l=array.length;i<l;i++){
                        var msg = {
                            username : array[i].u,
                            time : array[i].t,
                            msg : array[i].m
                        }
                        msgList.push(msg);
                    }
                }
            }
            callback(err, msgList);
        });
    },function(callback){//删除
        UserModel.update({u:username},{"ms":[]},callback);
    }],function(err,values){
        cb(err, values[0]);
    })
}

module.exports = friendDao;