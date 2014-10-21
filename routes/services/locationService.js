/**
 * Created by chenwen on 14-9-26.
 */
var locationDao = require("../dao/locationDao");
var Code = require("../../config/Code");
var async = require("async");

var locationService = {};

/**
 * 更新地理位置
 * @param username
 * @param msg
 * @param cb
 */
locationService.updatePosition = function(username, msg,cb){
    var position = msg.position;
    var applyName = msg.applyName;
    var id = msg.id;
    async.waterfall([function(callback){
        locationDao.updatePosition(id, username,applyName, position, function(err,code, data){
            if(err) return callback(err);
            callback(err, code,data || {});
        });
    },function(code,data,callback){
        if(code!=Code.OK) return callback(null, code);
        //这里接入路线接口
        var roadLine = data.roadLine;
        var newLine = {}; //新的路线,模拟用
        if(JSON.stringify(roadLine) != JSON.stringify(newLine)){ //如果新的路线和旧的路线不相同保存新的路线
            locationDao.updateRoadLine(id,username,applyName,newLine,function(err){
                if(err) return callback(err);
                data.roadLine = newLine;
                callback(err, code, data);
            });
        }
    }],cb)

}
/**
 * 获得地理位置
 * @param username
 * @param msg
 * @param cb
 */
locationService.getPosition = function(id,applyName, cb){
    locationDao.getPosition(id,applyName,cb);
}
/**
 * 断开连接
 * @param username
 * @param msg
 * @param cb
 */
locationService.disconnect = function(id, cb){
    locationDao.disconnect(id,cb);
}
module.exports = locationService;