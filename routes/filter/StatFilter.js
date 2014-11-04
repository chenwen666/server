/**
 * Created by chenwen on 14-11-3.
 */
var AggregateRoot = require("../lib/AggregateRoot");
var aggregate = new AggregateRoot("u");
/**
 * 好友状态
 * @param friendList
 */
module.exports.friendState = function(friendList, cb){
    friendList = aggregate.findByNames(friendList, cb);
    console.log(aggregate.listSync());
}

module.exports.add = function(obj,cb){
    aggregate.add(obj,cb);
    console.log(aggregate.listSync());
}

module.exports.set = function(key,propertyName,value, cb){
    aggregate.set(key,propertyName,value,cb);
    console.log(aggregate.listSync());
}

