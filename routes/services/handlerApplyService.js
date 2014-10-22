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
handlerApplyService.handlerList = function(username,cb){
    handlerApplyDao.handlerList(username,cb);
}

module.exports = handlerApplyService;