/**
 * Created by chenwen on 14-9-26.
 */

var dbUtils = require("../../util/dbUtils");
var log = require("../../util/logger.js");
var Code = require("../../config/Code");
var async = require("async");
var redis = require("../database/redis.js");
var SystemConfig = require("../../config/SystemConfig");

var locationDao = {};

module.exports = locationDao;
/**
 * 创建定位连接
 * @param id
 * @param username
 * @param applyName
 * @param cb
 */
locationDao.createLocationConnection = function(id,username,applyName,cb){
    redis.hmset(id,username,{},applyName,{},function(err){
        if(err) return cb(err);
        redis.expire(id,SystemConfig.REDIS_EXPIRE);
        cb(null);
    });
}
/**
 * 更新地理位置并返回对方的地理位置和到达路线
 * @param username
 * @param position
 */
locationDao.updatePosition = function(id,username,applyName, position, cb){
    async.waterfall([function(callback){
        redis.hgetall(id,callback);
    },function(res,callback){
        if(!res || !res[applyName]) return callback(null,Code.CONNECTION.NOT_BUILD, null);
        var data = res[applyName];
        var name = username+"to"+applyName;
        var line = res[name];
        var obj = {
            position : data,
            roadLine : line
        }
        redis.hset(id,username,position,function(err){
            callback(err, Code.OK,obj);
        });
    }],cb);
}
/**
 * 更新from到to的路线
 * @param id
 * @param from
 * @param to
 * @param line
 * @param cb
 */
locationDao.updateRoadLine = function(id,from ,to,line, cb){
    var name = from+"to"+to;
    redis.hset(id,name,JSON.stringify(line),cb);
}
/**
 * 根据id查找用户名
 * @param id
 * @param cb
 */
locationDao.getPosition = function(id, applyName, cb){
    redis.hget(id,applyName,cb);
}
/**
 * 断开连接
 * @param id
 * @param cb
 */
locationDao.disconnect = function(id, cb){
    redis.del(id,cb);
}
