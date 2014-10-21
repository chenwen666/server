/**
 * Created by chenwen on 14-9-26.
 */
var handlerApplyService = {};
var Page = require("../domain/page");
var handlerApplyDao = require("../dao/handlerApplyDao");
var async = require("async");
/**
 * 获取处理结果列表
 * @param username
 * @param cb
 */
handlerApplyService.handlerList = function(username, msg, cb){
    var page = new Page(msg);
    var ctrn = msg.ctrn || "t";
    var drtn = (msg.drtn == 1 || msg.drtn==-1) ? msg.drtn : 1;
    async.waterfall([function(callback){
        handlerApplyDao.handlerList(username,page,ctrn, drtn, callback)
    },function(page,callback){
        var content = page.content;
        var array = [];
        if(!!content){
            for(var i= 0,l=content.length; i<l; i++){
                array.push(content[i].id);
            };
        }
        /*
        handlerApplyDao.markAsRead(array,function(err){
            callback(err, page);
        })
        */
        callback(null, page);
    }],cb)

}

module.exports = handlerApplyService;