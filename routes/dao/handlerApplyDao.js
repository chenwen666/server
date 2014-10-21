/**
 * 处理结果dao
 * Created by chenwen on 14-9-26.
 */
var handlerApplyDao = {};
var UserModel = require("../model/UserModel");
var dbUtils = require("../../util/dbUtils");
var log = require("../../util/logger.js");
var HandlerApply = require("../domain/HandlerApply");
var Code = require("../../config/Code");
var async = require("async");
var redis = require("../database/redis");

/**
 * 插入一条处理结果
 * @param username
 * @param msg
 * @param cb
 */
handlerApplyDao.insert = function(username,msg,cb){
    var applyName = msg.applyName;
    var state = msg.state;
    var type = msg.type;
    var id = msg.id;
    var apply = {
        u : username,
        t : new Date(),
        s : state,
        tp : type,
        li : id
    };
    UserModel.update({u:applyName},{"$push":{"h":apply}},cb);
}

/**
 * 获取处理结果列表
 * @param usernmae
 * @param page
 * @param cb
 */
handlerApplyDao.handlerList = function(username, page,ctrn, drtn, cb){
    var pageNo = +page.pageNo;
    var pageEntries = +page.pageEntries;
    var startEntries = (pageNo-1)*pageEntries;
    /*
    dbUtils.findPage(UserModel,page,{u:username},{"h":{"$slice":[startEntries, pageEntries]}},function(res){
        if(!!res && !!res.h) return res.h.length;
        return 0;
    },function(list){
        var content = [];
        if(!!list && !!list.h){
            list = list.h;
            for(var i = 0, l=list.length;i<l;i++){
                var handlerApply = new HandlerApply();
                handlerApply.buildFormDb(list[i]);
                content.push(handlerApply);
            }
        }
        return content;
    },cb);
    */
    async.waterfall([function(callback){
        UserModel.findOne({u:username},null,function(err, results){
            if(err) return callback(err);
            if(!!results && !!results.h){
                callback(null, results.h);
            }else{
                callback(null, null);
            }
        });
    },function(list,callback){
        var content = [];
        if(!!list){
            for(var i = 0, l=list.length;i<l;i++){
                var handlerApply = new HandlerApply();
                handlerApply.buildFormDb(list[i]);
                content.push(handlerApply);
            }
        }
        callback(null, content);
    }],function(err,list){
        UserModel.update({u:username},{h:[]},function(err){
            if(err){
                log.error("handlerApplyDao.handlerList error:"+err.stack);
            }
        })
        cb(null, list);
    });

}
/**
 * 标记为已读
 * @param ids
 * @param cb
 */
handlerApplyDao.markAsRead = function(ids, cb){
//    HandlerApplyModel.update({_id:{$in:ids}},{r:HandlerApply.STATE.ALREADY_READ},{ multi: true },cb);
//    UserModel.update();
    cb();
}
module.exports = handlerApplyDao;