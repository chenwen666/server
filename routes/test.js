/**
 * Created by chenwen on 14-9-11.
 */
var express = require('express');
var router = express.Router();
var utils = require("../util/utils");
var requestUtils = require("../util/requestUtils");
var logger = require("../util/logger.js");
var Code = require("../config/Code.js");
var SystemConfig = require("../config/SystemConfig");
var userService = require("./services/userService");



router.get("/login",function(req, res){
    res.render("login");
});
router.get("/sign",function(req, res){
    console.log("签名测试");
    var args = ["username,password,timestrap"];
    var params = {username:"chenwen",password:"chenwen","timestamp":new Date().getTime()};
    var sign = requestUtils.getSign(args, params);
    console.log(sign);
    res.end();
});
router.get("/home",function(req, res){
    var token = req.query.token;
    var refreshToken = req.query.refreshToken;
    res.render("home",{token:token,refreshToken:refreshToken});
});
router.get("/session",function(req, res){
    var user = req.session.user;
    if(user) res.end(user.u);
    else res.end("没有登陆");
});
router.get("/token",function(req, res){
    res.render("getToken");
});
router.get("/auth",function(req, res){
    res.render("authToken");
});
router.get("/situation",function(req, res){
    res.render("getSituation");
});
router.get("/friends/search",function(req, res){
    res.render("searchUser");
});

router.get("/friends/request",function(req, res){
    res.render("addFriendRequest");
});

router.get("/friends/add/request/list",function(req, res){
    res.render("getFriendApplyList");
});
router.get("/friends/add/request/handler",function(req, res){
    res.render("handlerAddFriend");
});
router.get("/friends/list",function(req, res){
    res.render("getFriendList");
});
router.get("/friends/delete",function(req, res){
    res.render("deleteFriend");
});
router.get("/friends/handler/list",function(req, res){
    res.render("handlerList");
});
router.get("/location/position",function(req,res){
    res.render("updateMap");
});
router.get("/location/get",function(req, res){
    res.render("getMap");
});
router.get("/disconnect",function(req, res){
    res.render("disconnect");
});
router.get("/regist",function(req, res){
    res.render("userRegist");
});
router.get("/user/setNickName",function(req, res){
    res.render("setNickName");
});
router.get("/user/setPassword",function(req, res){
    res.render("setPassword");
});
router.get("/friends/sendMessage",function(req, res){
    res.render("sendMessage");
});
router.get("/friends/messageList",function(req, res){
    res.render("messageList");
});
router.get("/user/email/auth",function(req, res){
    res.render("emailValidate");
});
router.get("/user/email/send",function(req, res){
    res.render("sendEmail");
});
router.get("/user/setPortrait",function(req, res){
    res.render("setPortrait");
});
router.get("/test",function(req, res){
    res.render("mainTest");
})
module.exports = router;