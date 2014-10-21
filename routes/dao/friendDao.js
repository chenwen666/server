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
var redis = require("../database/redis.js");
var utils = require("../../util/utils");

var friendDao = {};

/**
 * 搜索好友(用户)
 * @param username
 * @param cb
 */
friendDao.search = function(username, searchName, cb){
    var self = this;
    async.waterfall([function(callback){//先从redis查询
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
    }],function(err, user){
        cb(err, user);
    });
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
        UserModel.findOne(conditions,callback);
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
friendDao.getRequestList = function(username, page,ctrn, drtn,cb){
    var pageNo = +page.pageNo;
    var pageEntries = +page.pageEntries;
    dbUtils.findPage(UserModel,page,{u:username},{"l":{"$slice":[(pageNo-1)*pageEntries,pageEntries]}},function(user){
        if(!!user.l)return user.l.length;
        return 0;
    },function(list){
        var array = list.l;
        var content = [];
        if(!!array){
            for(var i= 0,l=array.length;i<l;i++){
                var apply = new FriendApply();
                apply.buildFormDb(array[i]);
                content.push(apply);
            };
        }
        return content;
    },cb);
}
/**
 * 添加好友
 * @param username username加applyName
 * @param applyName
 * @param type
 * @param cb
 */
friendDao.addFriend = function(username, applyName, cb){
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
    async.waterfall([function(callback){
       UserModel.findOne({u:username,"l":{"$elemMatch":{"u":applyName,"tp":+type}}},callback);
    },function(user,callback){
        if(!user) return callback(null, 0);
        UserModel.update({u:username},{"$pull":{"l":{u:applyName,tp:+type}}},callback);
    }],function(err,data){
        cb(err, data);
    });
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
 * 获取好友分页
 * @param username
 * @param cb
 */
friendDao.findPageOfFriends = function(username,page,ctrn, drtn,cb){
    var pageNo = +page.pageNo;
    var pageEntries = +page.pageEntries;
    var startEntires = (pageNo-1)*pageEntries;
    async.waterfall([function(callback){  //从reidis中找
        redis.hget(username,"f",function(err,res){
            if(err) return callback(err,null);
            var friendList = JSON.parse(res);
            if(!!friendList){
                page.setTotalElements(friendList.length);
            }
            callback(null, friendList);
        });
    },function(friendList,callback){ //redis找不到,从mongoose中找
        if(!!friendList) return callback(null, friendList);
        dbUtils.findPage(UserModel,page,{u:username},{"f":{"$slice":[(pageNo-1)*pageEntries,pageEntries]}},function(res){
            if(!!res && !!res.f) return res.f.length;
            return 0;
        },function(res){
            if(!!res){
                redis.hset(username, "f",JSON.stringify(res.f), function(err){
                    if(err) log.error(username+" friendDao.findPageOfFriends好友列表存入数据库失败:"+err.stack);
                });
                return res.f;
            }
            return null;
        },function(err, page){
            if(err) return callback(err, null);
            if(!!page) return callback(null, page.content);
            return callback(null, []);
        })
    },function(friendList,callback){//查找用户信息
        var names = [];
        var array = [];
        var count = 0;
        if(!!friendList){
            for(var i= 0,l=friendList.length;i<l;i++){
                if(friendList[i].u){
                    names.push(friendList[i].u);
                }
            }
        }
        var query = UserModel.find({u:{"$in":names}},{h:0,t:0,ms:0,l:0,f:0,h:0,rt:0,p:0});
        query.sort({lt:-1});
        query.skip((pageNo-1)*pageEntries);
        query.limit(pageEntries);
        query.exec(function(err,users){
            if(err) return callback(err,null);
            if(!!users){
                for(var i= 0,l=users.length;i<l;i++){
                    for(var j = 0,t=friendList.length;j<t;j++){
                        if(users[i].u == friendList[j].u){
                            var friend = new User().buildFormDb(users[i]);
                            friend.addTime = friendList[j].at;
                            array.push(friend);
                            break;
                        }
                    }
                }
            }
            page.setContent(array)
            callback(null, page);
        });
    }],cb);
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
            if(!friendList)return callback(null, false);
            try{
                friendList = JSON.parse(friendList);
                return callback(null, utils.isExistOfArray(friendList, "u", applyName));
            }catch(e){//如果发生错误重新从mongodb中加载
                return callback(null,false);
            }
        });
    },function(isFriend, callback){
        if(isFriend) return callback(null, isFriend);
        UserModel.findOne({u:username},function(err,user){
            if(err) return callback(err,false);
            if(!user || !user.f) return callback(null, false);
            var friendList = user.f;
            if(!!friendList){
                var flag = utils.isExistOfArray(friendList,"u", applyName);
                if(flag){
                    //因为redis没有找到mongoose找到了,重新更新reids
                    redis.hset(username,"f",JSON.stringify(friendList),function(err){
                        if(err) log.error("friendDao.isFriend 好友列表写入reids失败:"+err.stack);
                    });
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
        userDao.get(applyName, callback);
    },function(user, callback){
        if(!user) return callback(null, Code.USERS.NOT_EXIST);
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