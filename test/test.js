/**
 * Created by chenwen on 14-10-13.
 */
var http = require("http");
var qs=require('querystring');
var SystemConfig = require("../config/SystemConfig");
var crypto = require("crypto");
var host = "127.0.0.1";
var port = 3000;

function getOption(url, method){
    var options = {
        hostname: host,
        port: port,
        path: url,
        method: method,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded'
        }
    }
    return options;
}

function request(options,content, func,errfunc){
    var chunk;
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', func);
    });
    req.on('error', errfunc);
    req.write(qs.stringify(content));
    req.end();
}
/**
 * 登陆
 * @param username
 * @param password
 * @param timestrap
 */
function testLogin(username, password,timestrap){
    var getSign = function(args, msg){
        var paramArgs = [];
        for(var key in args){
            paramArgs.push(key);
        }
        var signValue = '';
        var index = 0;
        var paramNameAndValueArray = [];
        for(var i = 0,l = paramArgs.length; i<l; i++){
            var msgValue = msg[paramArgs[i]];
            if(msgValue){
                paramNameAndValueArray[index] = paramArgs[i]  + msgValue;
                index++;
            }
        }
        paramNameAndValueArray.sort();
        for(var i= 0,l=paramNameAndValueArray.length; i<l; i++) {
            signValue += paramNameAndValueArray[i];
        }
        //首尾加上秘钥
        signValue = SystemConfig.SECRET + signValue + SystemConfig.SECRET;
        signValue = encodeURIComponent(signValue);

        signValue = crypto.createHash('sha256').update(signValue).digest('hex').toUpperCase();
        return signValue;
    }
    var content = {
        username : username,
        password : password,
        timestrap: timestrap
    }
    var sign = getSign({"username":true,"password":true,"timestrap":true,"sign":true,"redirectURL":false,"scope":false},content);
    content.sign = sign;
    request(getOption("/oauth2/login","POST"), content, function(chunk){
        console.log("登陆授权测试成功:"+JSON.stringify(chunk));
    },function(err){
        console.log("登陆近观权测试失败:"+JSON.stringify(err));
    })
}
/**
 * 获取token
 * @param refreshToken
 * @param username
 */
function findTokenByRefreshToken(refreshToken, username){
    var content = {
        username:username,
        refreshToken:refreshToken
    }
    request(getOption("/oauth2/token","POST"),content,function(data){
        console.log("获取token:"+JSON.stringify(data));
    },function(err){
        console.log("获取token错误:"+err);
    })
}

/**
 * 用户注册
 * @param username
 * @param password
 * @param nickName
 * @param mobile
 * @param email
 */
function userRegist(username, password,nickName,mobile,email){
    var content = {
        username:username,
        password:password,
        nickName:nickName,
        mobile:mobile,
        email:email
    }
    request(getOption("/user/regist","POST"),content,function(data){
        console.log("用户注册:"+JSON.stringify(data));
    },function(err){
        console.log("用户注册错误:"+err);
    })
}
/**
 * 获取场景数据
 * @param token
 * @param devId
 */
function getSituation(token, devId){
    var content = {
        token : token,
        devId : devId
    }
    request(getOption("/situation","POST"),content,function(data){
        console.log("获取场景数据:"+JSON.stringify(data));
    },function(err){
        console.log("用户注册错误:"+err);
    })
}
testLogin("chenwen","1",new Date().getTime());
//userRegist("wangwu","123456","王五","123",null);
//findTokenByRefreshToken("a28f900b8f81fd37916c870e32c874ee8be496c273b930faf634b1bf04725323","chenwen");
//getSituation("abc","00:11:72:a3:63:2a")


/**
 方法介绍 根据文档填参数
 userRegist(username, password,nickName,mobile,email) 用户注册
 testLogin(username, password,timestrap)   登陆
 function findTokenByRefreshToken(refreshToken, username) 获取token
 */
