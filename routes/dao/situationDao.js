/**
 * Created by chenwen on 14-9-17.
 */
var Situation = require("../model/Situation");
var DeviceModel = require("../model/DeviceModel");
var Device = require("../domain/Device");
var log = require("../../util/logger");
var async = require("async");

var situationDao = {};


/**
 * 根据设备ID,查询场景数据
 * @param devId
 * @param cb
 */
situationDao.findByDeviceId = function(devId, cb){
    async.waterfall([function(callback){
        DeviceModel.findOne({"id":devId},function(err, device){
            if(err) return callback(err,null);
            if(!device){
                callback(null, null);
            }else{
                callback(null, device);
            }
        });
    },function(device,callback){
        var sid = device.p;
        if(!sid) return callback(null, null);
        Situation.findOne({"id":sid},function(err, doc){
            if(err) return callback(err);
            device = new Device().buildFormDb(device);
            callback(null, doc,device);
        });
    }],function(err, doc,device){
        doc = doc || "";
        cb(err, {chilrds:doc.c,f:doc.f},device);
    })
}
module.exports = situationDao;

