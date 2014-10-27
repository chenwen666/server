/**
 * Created by chenwen on 14-10-24.
 */
var http = require("http");
var async = require("async");
var userService = require("./routes/services/userService");
var friendService = require("./routes/services/friendService");
var locationService = require("./routes/services/locationService");
var situationService = require("./routes/services/situationService");
var Code = require("./config/Code");
var requestUtils = require("./util/requestUtils");
var log = require("./util/logger");
var server = http.createServer(function(req, res){
    async.waterfall([function(callback){
        regist(callback);
    },function(username,password,callback){
        log.info("注册username:"+username+" password:"+password);
        login(username,password, callback);
    },function(data,callback){
        log.info("登陆:%j",data);
        var re = data.refreshToken;
        var username = "";
        if(!!data.user){
            username = data.user.username;
        }
        refreshToken(username,re,callback);
    },function(data,callback){
        log.info("刷新token:%j",data);
        var username = "";
        if(!!data.user) username = data.user.username;
        var token = data.token;
        setNickName(username,"1111111",function(err){
            callback(err,username, token);
        })
    },function(username, token,callback){
        log.info("修改昵称成功:"+username);
        setPassword(username,"1",function(err){
            callback(err,username,token);
        })
    },function(username, token ,callback){
        log.info("修改密码成功:"+username);
        addRequest(username,function(err){
            callback(err, username, token);
        })
    },function(username, token, callback){
        log.info("添加申请成功:"+username);
        requestList(username,function(err,data){
            callback(err, username, token,data.content);
        })
    },function(username, token ,content,callback){
        log.info("获取申请列表成功:%j",content);
        var applyName = "";
        var state = 1;
        var type =1;
        var id = 0;
        if(!!content && content.length>=1){
            var apply = content[0];
            applyName = apply.username;
            type = apply.type;
            id = apply.id;
        }
        handleRequest(username,applyName,state,type,function(err){
            log.info("处理请求"+err+"    "+username+"    "+applyName+"      "+id);
            callback(err,username,applyName, token,id);
        })
    },function(username, applyName, token, id, callback){
        updateLocation(username,applyName,id,function(err,data){
            log.info("更新地理位置:"+err+"   \n"+JSON.stringify(data));
            callback(err, username,token,id);
        })
    },function(username, token, id,callback){
        disconnect(id,function(err){
            log.info("断开连接:"+err);
            callback(err, username, token);
        })
    },function(username, token,callback){
        sendMessage(username,"11111111",function(err){
            log.info("发送消息:"+err);
            callback(err, username, token);
        })
    },function(username, token,callback){
        messageList(username,function(err, data){
            log.info("消息列表:"+err+"    "+JSON.stringify(data));
            callback(err,username, token);
        })
    },function(username, token, callback){
        friendList(username,function(err,data){
            if(err){
                log.info("获取好友列表失败:"+err.stack);
            }
            log.info("获取好友列表:%j",data);
            callback(err, username, token,data.content);
        })
    },function(username, token, content,callback){
        var applyName = "";
        if(!!content && content.length>=1){
            applyName = content[0].username;
        }
        deleteFriend(username, applyName, function(err){
            log.info("删除好友:"+err);
            callback(err, username, token);
        })
    },function(username, token,callback){
        getSituation("00:11:78:87:50:E9",function(err){
            log.info("获取场景数据:"+err);
            callback(err, username, token);
        })
    }],function(err){
        if(err){
            res.end(err.stack);
        }else{
            res.end("200");
        }
    })
}).listen(8080);
//注册
function regist(cb){
    var username = Math.floor(Math.random()*1000000)+"";
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
    userService.validateUser({
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
            applyName : Math.floor(Math.random()*1000000)+"",
            type : 1
        },callback)
    },function(callback){
        friendService.addRequest(username,{
            applyName : Math.floor(Math.random()*1000000)+"",
            type : 2
        },callback)
    }],cb)
}
//获取申请列表
function requestList(username, cb){
    friendService.getRequestList(username,{},cb);
}
//处理好友请求
function handleRequest(username, applyName, state, type,cb){
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
function handleList(username,cb){
    friendService.getRequestList(username,{},cb);
}
//获取好友列表
function friendList(username, cb) {
    friendService.friendList(username,{},cb);
}
//删除好友
function deleteFriend(username, applyName, cb){
    friendService.delete(username,applyName,cb);
}
//发送消息
function sendMessage(username,msg,cb){
    var applyName = Math.floor(Math.random()*1000000)+"";
    friendService.sendMessage(username, applyName, msg, cb);
}

//获取消息列表
function messageList(username, cb){
    friendService.messageList(username, cb);
}
//更新地理位置
function updateLocation(username,applyName,id,cb){
    locationService.updatePosition(username,{
        applyName : applyName,
        id : id,
        position : {a:1,b:190,c:13}
    },cb);
}
//断开连接
function disconnect(id, cb){
    locationService.disconnect(id, cb);
}
//获取场景数据
function getSituation(devid,cb){
    situationService.findById({
        devId : devid
    },cb)
}