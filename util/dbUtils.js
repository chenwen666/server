/**
 * Created by Administrator on 2014/7/15.
 */
var log = require("./logger");
var async = require("async");
/**
 * 查询单个对象
 * @param Model   //模型
 * @param opts    //过滤
 * @param runsArgs  //返回字段，如果为null就返回全部
 * @param cb        //回调方法
 */
module.exports.findOne = function(Model, opts, runsArgs,buildResObjFun, cb){
    log.info("查找单个对象开始....");
    Model.findOne(opts, runsArgs, function(err, res) {
        if(err){
            log.error("dbUtils.findOne.error:"+err.stack);
            cb(err,null);
            return;
        }
        var obj = res;
        if(buildResObjFun && typeof buildResObjFun == "function"){
            obj = buildResObjFun(res);
        }
        cb(err, obj);
    });
}

/**
 * 插入对象
 * @param Model
 * @param opts
 * @param cb
 */
module.exports.insert = function(model, opts, cb){
    log.info("插入对象开始.....");
    model.save(opts, function(err, res){
        if(err){
            log.error("dbUtils.insert.error:"+err.stack);
            cb(err,null);
        }else{
            cb(null, res);
        }
    });
}
/**
 *修改
 * @param conditions  //条件
 * @param update       //修改的内容
 * @param options      //
 * @param cb
 */
module.exports.update = function(Model,conditions, update , options, cb){
    if(typeof options === "function"){
        cb = options;
        options = {};
    }
    Model.update(conditions,update,options,function(err, data){
        if(err){
            log.error("dbUtils.update.error:"+err.stack);
            cb(err,null);
        }else{
            cb(err, data);
        }
    });
}
/**
 * 分页
 * @param Model
 * @param conditions  查询条件
 * @param runsArgs   返回字段
 * @param sortArgs   排序字段
 * @param isDistinct  是否不重复
 * @param cb
 */
module.exports.findPage = function(Model,page, conditions,fields,countFun,buildFun,cb){
    var self = this;
    async.parallel([function(callback){
        Model.findOne(conditions,function(err,user){
            if(err) return callback(err);
            if(!!user){
                var count = countFun(user);
                page.setTotalElements(count);
            }
            callback(null);
        });
    },function(callback){
        Model.findOne(conditions,fields,function(err,list){
            if(err) return callback(err);
            if(!!list && !!buildFun){
                var content = buildFun(list);
                page.setContent(content);
            }
            callback(null);
        });
    }],function(err){
        cb(err, page);
    });
}

/**
 * 获得总数
 * @param Model
 * @param conditions
 * @param cb
 */
module.exports.count = function(Model,conditions,cb){
    Model.count(conditions,function(err, count){
        if(err){
            log.error("查询总数失败:"+err.stack);
        }
        cb(err, count);
    });
}
/**
 * 更新
 * @param conditions
 * @param update
 * @param options
 * @param cb
 */
module.exports.update = function(Model,conditions, update, options, cb){
    Model.update(conditions, update, options,function(err ,res){
        if(err){
            log.error("更新错误: %s"+err.stack,JSON.stringify(conditions));
        }
        cb(err, res);
    });
}
/**
 * 删除
 * @param Model
 * @param conditions
 * @param cb
 */
module.exports.delete = function(Model,conditions,cb){
    Model.remove(conditions,function(err, value){
        if(err){
            log.error("删除失败: %s"+err.stack,JSON.stringify(conditions));
        }
        cb(err, value);
    });
}