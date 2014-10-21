/**
 * 用户dao
 * Created by chenwen on 14-9-11.
 */
var UserModel = require("../model/UserModel");
var User = require("../domain/User");
var async = require("async");
var log = require("../../util/logger");
var Code = require("../../config/Code");
var redis = require("../database/redis")
var SystemConfig = require("../../config/SystemConfig");
var requestUtils = require("../../util/requestUtils");
var Friend = require("../domain/Friend");
var userDao = {};

/**
 * 验证用户名和密码
 * @param username
 * @param password
 * @param cb
 */
userDao.validateUser = function(username, password, expire, cb){
    var date = new Date();
    expire = getExpireTime(expire);
    var self = this;
    async.waterfall([function(callback){
        self.get(username,callback);
    },function(user,callback){
        var validatePassword = function(user, callback){
            if(user.p != password) return callback(new Error(),{code:Code.USERS.PASSWORD_ERROR});
            callback(null,user);
        }
        if(!user) return callback(new Error(),{code : Code.USERS.USERNAME_NOT_EXISTS});
        if(!user.p){
            UserModel.findOne({u:username},function(err,user){
                if(err) return callback(err,null);
                validatePassword(user,callback);
            });
        }else{
            validatePassword(user,callback);
        }
    },function(user,callback){
        var token = requestUtils.generateToken(username, expire);
        var flag = !!user.u;
        var refreshToken = user.rt || requestUtils.generateRefreshToken(username);
//        var refreshToken = requestUtils.generateRefreshToken(username);
        async.parallel([function(callback){
            var friends = user.f || [];
            if(friends instanceof Array){
                friends = JSON.stringify(friends);
            }
            redis.hmset(username,"p", password, "rt", refreshToken,"t",token,"e",expire,"g",user.g || "","b",user.b || "","n",
                user.n || "","m",user.m || "","em",user.em || "","re",user.re || "","lt",user.lt,"im",user.im || "" ,
                "a",user.a || "","f",friends || [],callback);
        },function(callback){
            UserModel.update({u:username},{rt:refreshToken,t:{n:token,e:expire}}, callback);
        }],function(err, values){
            if(err){
                log.error("userDao.validateUser update token error:"+err.stack);
                return callback(err,{code: Code.SYSTEM_ERROR});
            }
            var u = new User();
            u.buildFormDb(user);
            u.username = username;
            callback(null, {code : Code.OK, user : u, token : token, refreshToken : refreshToken});
        });
    }], function(err, data){
        if(err && (!data || !data.code)){ //如果有错,并且ata为空或data.code为空
            log.error("userDao.validateUser error:"+err.stack);
            return cb(null, Code.SYSTEM_ERROR);
        }
        //最后更新时间
        if(!!data && data.code === Code.OK){
            UserModel.update({u:username},{lt:date},function(){});
            redis.hset(username,"lt",date,function(){
                redis.expire(username,SystemConfig.REDIS_EXPIRE);
            });
        }
        cb(null, data);
    });
}

/**
 * 通过用户名查询用户信息
 * @param username
 * @cb
 */
userDao.get = function(username, cb){
    async.waterfall([function(callback){
        redis.hgetall(username,function(err, user){
            if(err){
                log.error("用redis获取用户数据失败:"+err.stack);
                return callback(err);
            }
            callback(err, user);
        });
    },function(user, callback){
        if(user) return callback(null,user); //如果redis中有,就直接返回
        UserModel.findOne({u:username}, function(err, user){  //否则从mongodb中读取
            if(err){
                log.error("userDao.get 获取用户信息失败:"+err.stack);
                return callback(err);
            }
            if(!!user){
                var friends = user.f || [];
                if(friends instanceof Array){
                    friends = JSON.stringify(friends);
                }
                user.t = user.t || "";
                var token = user.t || user.t.n;
                var expire = user.e || user.t.e;
                redis.hmset(username,"p", user.p, "rt", user.rt,"t",token,"e",expire,"g",user.g || "","b",user.b || "","n",
                    user.n || "","m",user.m || "","em",user.em || "","re",user.re || "","lt",user.lt,"im",user.im || "" ,
                    "a",user.a || "","f",friends || [],function(err){
                        if(err) log.error("查找用户信息保存redis失败(不影响返回结果):"+err.stack);
                        redis.expire(username,SystemConfig.REDIS_EXPIRE);
                    });
            }
            callback(err, user);
        });
    }],cb);
}
/**
 * 创建一个新的token
 * @param username
 * @param cb
 */
userDao.createToken = function(username,refreshToken, expire, cb){
    expire = getExpireTime(expire);
    var self = this;
    async.waterfall([function(callback){
        self.get(username,callback);
    },function(user, callback){
        if(!user)return callback(new Error(),{code : Code.USERS.USERNAME_NOT_EXISTS});
        var reToken = user.rt;
        if(reToken == refreshToken)callback(null, user);
        else callback(new Error(),{code : Code.TOKEN.INVALID});
    },function(user,callback){
        var token = requestUtils.generateToken(username);
        self.updateToken(username, token,expire,function(err, data){
            if(err) return callback(err);
            var u = new User();
            u.buildFormDb(user);
            u.username = username;
            data.user = u;
            callback(err, data);
        });
    }],function(err ,data){
        if(err && (!data || !data.code)){
            log.error("userDao.getToken error:"+err.stack);
            return cb(null, Code.SYSTEM_ERROR);
        }
        cb(null, data);
    });
}
/**
 * 更新token
 * @param username
 * @param token
 * @param expire
 * @param cb
 */
userDao.updateToken = function(username, token,expire,cb){
    async.parallel([function(callback){
        redis.hmset(username,"t",token,"e",expire, callback);
    },function(callback){
        UserModel.update({u:username},{t:{n:token,e:expire},lt:new Date()}, callback);
    }],function(err, values){
        if(err){
            log.error("userDao.updateToken error:"+err.stack);
            return cb(err,{code: Code.SYSTEM_ERROR});
        }
        cb(null,{code:Code.OK,token:token});
    });
}
/**
 * 验证token
 * @param username
 * @param token
 * @param cb
 */
userDao.validateToken = function(username, token, cb){
    this.get(username,function(err, user){
        if(err) return cb(err);
        if(!user) return cb(err, Code.USERS.USERNAME_NOT_EXISTS);
        var tk;
        if(user.t && user.t.n) tk = user.t.n;
        else tk = user.t;
        var expire =user.e || user.t.e;
        if(tk != token)return cb(null,Code.TOKEN.INVALID);
        if(new Date().getTime() > expire) return cb(null,Code.TOKEN.ALREADY_EXPIRE);
        cb(null, Code.OK);
    });
}
/**
 * 注册
 * @param msg
 * @param cb
 */
userDao.regist = function(msg, cb){
    var self = this;
    var username = msg.u;
    async.waterfall([function(callback){
        self.get(username,callback);
    },function(user, callback){
        if(!!user) return callback(new Error(), Code.USERS.USERNAME_ALREADY_REGIST);
        if(!!msg.em){
            self.findbyEmail(msg.em,callback);//检查邮箱是否占用
        }else{
            callback(null,user);
        }
    },function(user, callback){
        if(!!user) return callback(new Error(), Code.USERS.EMAIL_EXIST);
        if(!!msg.m){
            self.findbyMobile(msg.m,callback); //检查手机号是否被占用
        }else{
            callback(null, user);
        }
    },function(user, callback){
        if(!!user) return callback(new Error(), Code.USERS.MOBILE_EXIST);
        var user = new UserModel(msg);
        user.save(function(err){
            if(err) return callback(err, Code.SYSTEM_ERROR);
            return callback(null, Code.OK);
        });
    }],cb);
}
/**
 * 修改昵称
 * @param username
 * @param nickName
 * @param cb
 */
userDao.setNickName = function(username, nickName, cb){
    async.parallel([function(callback){
        UserModel.update({u:username},{"n":nickName},callback);
    },function(callback){
        redis.hset(username,"n",nickName,callback);
    }],cb)

}

/**
 * 修改密码
 * @param username
 * @param nickName
 * @param cb
 */
userDao.setPassword = function(username, password, cb){
    async.parallel([function(callback){
        UserModel.update({u:username},{"p":password},cb);
    },function(callback){
        redis.hset(username,"p",password, callback);
    }],cb)
}
/**
 * 根据邮箱查找用户
 * @param expire
 * @returns {number}
 */
userDao.findbyEmail = function(email, cb){
    UserModel.findOne({em : email}, cb);
}
/**
 * 根据手机号查找用户
 * @param expire
 * @returns {number}
 */
userDao.findbyMobile = function(mobile, cb){
    UserModel.findOne({m : mobile}, cb);
}
/**
 * 设置头像地址
 * @param username
 * @param path
 * @param cb
 */
userDao.setPortrait = function(username, path, cb){
    async.parallel([function(callback){
        UserModel.update({u:username},{im:path},callback);
    },function(callback){
        redis.hset(username,"im",path, callback);
    }],cb)

}
/**
 * 计算过期时间
 * @param expire
 */
function getExpireTime(expire){
    expire = expire || SystemConfig.DEFAULT_TOKEN_EXPIRE;
    expire = new Date().getTime()+expire;
    return expire;
}

module.exports = userDao;