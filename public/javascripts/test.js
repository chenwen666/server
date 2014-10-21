/**
 * Created by chenwen on 14-10-16.
 */
var Helper = (function($){
    var Mod = function(count,time){
        this.date = new Date().getTime();
        this.count = count;
        this.time = time;
        this.loginSumCount = 0;
        this.loginSuccessCount = 0;
        this.loginErrorCount = 0;

        this.searchSumCount = 0;
        this.searchSuccessCount = 0;
        this.searchErrorCount = 0;

        this.refreshSumCount = 0;
        this.refreshSuccessCount = 0;
        this.refreshErrorCount = 0;

        this.situationSumCount = 0;
        this.situationSuccessCount = 0;
        this.situationErrorCount = 0;

        this.friendSumCount = 0;
        this.friendSuccessCount = 0;
        this.friendErrorCount = 0;
    };
    //ajax
    Mod.prototype.send = function(url, method,data,successFun,errFun){
        $.ajax({
            url : url,
            type : method,
            data : data,
            success : successFun,
            error : errFun
        });
    }
    //登陆
    Mod.prototype.authLogin = function(username, password){
        var self = this;
        var timestrap = new Date().getTime();
        var sign = this.getSign(["username","password","timestrap"],{username:username,password:password,timestrap:timestrap});
        var content = {
            username:username,
            password:password,
            timestrap:timestrap,
            sign:sign
        }
        var setText = function(){
            if(self.loginSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#loginTime").text(cha);
            }
            if(self.loginSumCount<self.count){
                setTimeout(self.authLogin(username,password),self.time);
            }
        }
        this.send("/oauth2/login","POST",content,function(data){
            self.token = data.token;
            self.loginSuccessCount++;
            self.loginSumCount++;
            $("#loginAccessCount").text(self.loginSuccessCount);
            setText();

        },function(err){
            self.loginErrorCount++;
            self.loginSumCount++;
            $("#loginErrorCount").text(self.loginErrorCount);
            setText()
        });
    };
    //刷新token
    Mod.prototype.refreshToken = function(refreshToken,username){
        var self = this;
        var setText = function(){
            if(self.refreshSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#refreshTime").text(cha);
            }
            if(self.refreshSumCount<self.count){
                setTimeout(self.refreshToken(refreshToken, username),self.time);
            }
        }
        var content = {
            refreshToken : refreshToken,
            username:username
        }
        this.send("/oauth2/token","POST",content,function(){
            self.refreshSuccessCount++;
            self.refreshSumCount++;
            $("#refreshAccessCount").text(self.refreshSuccessCount);
            setText();
        },function(){
            self.refreshErrorCount++;
            self.refreshSumCount++;
            $("#refreshErrorCount").text(self.refreshErrorCount);
            setText()
        })
    }
    //搜索用户
    Mod.prototype.search = function(username,token){
        var self = this;
        var setText = function(){
            if(self.searchSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#searchTime").text(cha);
            }
            if(self.searchSumCount<self.count){
                setTimeout(function(){
                    self.search(username,token)
                },self.time);
            }
        }
        var content = {
            token : token || this.token,
            applyName:username
        }
        this.send("/friends/search","get",content,function(){
            self.searchSuccessCount++;
            self.searchSumCount++;
            $("#searchAccessCount").text(self.searchSuccessCount);
            setText();
        },function(){
            self.searchErrorCount++;
            self.searchSumCount++;
            $("#searchErrorCount").text(self.searchErrorCount);
            setText()
        })
    }
    //获取场景数据
    Mod.prototype.situation = function(token,divId){
        var self = this;
        var setText = function(){
            if(self.situationSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#situationTime").text(cha);
            }
            if(self.situationSuccessCount<self.count){
                setTimeout(function(){
                    self.situation(token,divId);
                },self.time);
            }
        }
        var content = {
            token : token || this.token,
            devId:divId
        }
        this.send("/situation","POST",content,function(){
            self.situationSuccessCount++;
            self.situationSumCount++;
            $("#situationAccessCount").text(self.situationSuccessCount);
            setText();
        },function(){
            self.situationErrorCount++;
            self.situationSumCount++;
            $("#situationErrorCount").text(self.situationErrorCount);
            setText()
        })
    }
    //获取好友列表
    Mod.prototype.friendList = function(token){
        var self = this;
        var setText = function(){
            if(self.friendSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#friendListTime").text(cha);
            }
            if(self.friendSumCount<self.count){
                setTimeout(function(){
                    self.friendList(token);
                },self.time);
            }
        }
        var content = {
            token : token || this.token
        }
        this.send("/friends/list","get",content,function(){
            self.friendSuccessCount++;
            self.friendSumCount++;
            $("#friendListAccessCount").text(self.friendSuccessCount);
            setText();
        },function(){
            self.friendErrorCount++;
            self.friendSumCount++;
            $("#friendListErrorCount").text(self.friendErrorCount);
            setText()
        })
    }
    Mod.prototype.getSign = function(paramArgs, msg){
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
        signValue = encodeURIComponent(signValue);
        signValue = hex_sha256(signValue).toUpperCase();
        //加盐
        /*
         bcrypt.genSalt(18,function(err, salt){
         if(err){

         }
         bcrypt.hash(signValue, salt,function(err, hash){
         if(err){

         }
         cb(err, signValue)
         })
         });
         */
//    return crypto.createHash("sha1").update(signValue).digest("hex").toUpperCase();
        return signValue;
    }
    return Mod;
})($)