/**
 * Created by chenwen on 14-10-24.
 */
var http = require("http");
var async = require("async");
var userService = require("../routes/services/userService");
var friendService = require("../routes/services/friendService");

var server = http.createServer(function(req, res){

});
//注册
function regist(cb){
    var username = new Date().getTime();
    var password = "1";
    var email = new Date().getTime();
    var nickName = "xiaoxiao";
    userService.regist({
        username : username,
        password : password,
        email : email,
        nickName : nickName
    },function(err){
        cb(err, username, password);
    })
}
//登陆
function login(username,password,cb){
    userService.validateToken({
        username : username,
        password : password
    },function(err, data){
        cb(err, data);
    })
}
//刷新token
function refreshToken(username,refreshToken,cb){
    userService.createToken({
        username : username,
        refreshToken : refreshToken
    },cb)
}
//搜索用户
function search(username,applyName,cb) {
    friendService.search(username,applyName,cb);
}
//修改密码
function setPassword(username, password,cb){
    userService.setPassword({
        username : username,
        password : password
    },cb)
}
//修改昵称
function setNickName(username,nickName,cb){
    userService.setNickName({
        username : username,
        nickName : nickName
    },cb)
}
//添加申请
function addRequest(username,cb){
    async.parallel([function (callback) {
        friendService.addRequest(username,{
            applyName : Math.floor(Math.random()*10000)+"",
            type : 1
        },callback)
    },function(callback){
        friendService.addRequest(username,{
            applyName : Math.floor(Math.random()*10000)+"",
            type : 2
        },callback)
    }],cb)
}
//获取申请列表
function requestList(username, cb){
    friendService.getRequestList(username,{},cb);
}
//处理好友请求
function handleRequest(username, applyName, state, type){
    if(type == 1) {
        friendService.handlerAddRequest(username,{
            applyName : applyName,
            state : state,
            type : type
        },cb)
    }else{
        friendService.handlerLocationRequest(username,{
            applyName : applyName,
            state : state,
            type : type
        },cb)
    }
}
//获取处理结果
function handleList(){}
