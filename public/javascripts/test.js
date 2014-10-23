/**
 * Created by chenwen on 14-10-16.
 */
var Helper = (function($){
    var Mod = function(count,time, number){
        this.date = new Date().getTime();
        this.count = count;
        this.time = time;
        this.number = number;

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

        this.registSumCount = 0;
        this.registSuccessCount = 0;
        this.registErrorCount = 0;

        this.addApplySumCount = 0;
        this.addApplySuccessCount = 0;
        this.addApplyErrorCount = 0;

        this.sendMessageSumCount = 0;
        this.sendMessageSuccessCount = 0 ;
        this.sendMessageErrorCount = 0;

        this.applyListSumCount = 0;
        this.applyListSuccessCount = 0;
        this.applyListErrorCount = 0;

        this.messageListSumCount = 0;
        this.messageListSuccessCount = 0 ;
        this.messageListErrorCount = 0;f

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
    //注册
    Mod.prototype.regist = function(){
        var self = this;
        var timestrap = new Date().getTime();
        var setText = function(){
            if(self.registSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#registTime").text(cha);
            }
            if(self.registSumCount<self.count){
                setTimeout(self.regist(),self.time);
            }
        }
        for(var i=0;i<self.number;i++) {
            var content = {
                username : self.registSumCount +"",
                password : "1"
            }
            this.send("/user/regist", "POST", content, function (data) {
                self.registSuccessCount++;
                self.registSumCount++;
                $("#registAccessCount").text(self.registSuccessCount);
                setText();

            }, function (err) {
                self.registErrorCount++;
                self.registSumCount++;
                $("#registErrorCount").text(self.registErrorCount);
                setText()
            });
        }
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
        for(var i=0;i<self.number;i++) {
            this.send("/oauth2/login", "POST", content, function (data) {
                self.token = data.token;
                self.loginSuccessCount++;
                self.loginSumCount++;
                $("#loginAccessCount").text(self.loginSuccessCount);
                setText();

            }, function (err) {
                self.loginErrorCount++;
                self.loginSumCount++;
                $("#loginErrorCount").text(self.loginErrorCount);
                setText()
            });
        }
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
        for(var i=0;i<self.number;i++) {
            this.send("/oauth2/token", "POST", content, function () {
                self.refreshSuccessCount++;
                self.refreshSumCount++;
                $("#refreshAccessCount").text(self.refreshSuccessCount);
                setText();
            }, function () {
                self.refreshErrorCount++;
                self.refreshSumCount++;
                $("#refreshErrorCount").text(self.refreshErrorCount);
                setText()
            })
        }
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
        for(var i=0;i<self.number;i++) {
            this.send("/situation", "POST", content, function () {
                self.situationSuccessCount++;
                self.situationSumCount++;
                $("#situationAccessCount").text(self.situationSuccessCount);
                setText();
            }, function () {
                self.situationErrorCount++;
                self.situationSumCount++;
                $("#situationErrorCount").text(self.situationErrorCount);
                setText()
            })
        }
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
        for(var i=0;i<self.number;i++) {
            this.send("/friends/list", "get", content, function () {
                self.friendSuccessCount++;
                self.friendSumCount++;
                $("#friendListAccessCount").text(self.friendSuccessCount);
                setText();
            }, function () {
                self.friendErrorCount++;
                self.friendSumCount++;
                $("#friendListErrorCount").text(self.friendErrorCount);
                setText()
            })
        }
    }
    //添加好友申请
    Mod.prototype.addApply = function(){
        var self = this;
        var setText = function(){
            if(self.addApplySumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#addApplyTime").text(cha);
            }
            if(self.addApplySumCount<self.count){
                setTimeout(function(){
                    self.addApply();
                },self.time);
            }
        }
        for(var i=0;i<self.number;i++) {
            var content = {
                applyName : self.addApplySumCount,
                msg : new Date()
            }
            this.send("/friends/request", "POST", content, function () {
                self.addApplySuccessCount++;
                self.addApplySumCount++;
                $("#addApplyAccessCount").text(self.addApplySuccessCount);
                setText();
            }, function () {
                self.addApplyErrorCount++;
                self.addApplySumCount++;
                $("#addApplyErrorCount").text(self.addApplyErrorCount);
                setText()
            })
        }
    }
    //发送消息
    Mod.prototype.sendMessage = function(){
        var self = this;
        var setText = function(){
            if(self.sendMessageSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#sendMessageTime").text(cha);
            }
            if(self.sendMessageSumCount<self.count){
                setTimeout(function(){
                    self.sendMessage();
                },self.time);
            }
        }
        for(var i=0;i<self.number;i++) {
            var content = {
                applyName : self.addApplySumCount,
                msg : new Date()
            }
            this.send("/friends/message", "POST", content, function () {
                self.sendMessageSuccessCount++;
                self.sendMessageSumCount++;
                $("#sendMessageAccessCount").text(self.sendMessageSuccessCount);
                setText();
            }, function () {
                self.sendMessageErrorCount++;
                self.sendMessageSumCount++;
                $("#sendMessageErrorCount").text(self.sendMessageErrorCount);
                setText()
            })
        }
    }
    //获取申请列表
    Mod.prototype.applyList = function(){
        var self = this;
        var setText = function(){
            if(self.applyListSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#applyListTime").text(cha);
            }
            if(self.applyListSumCount<self.count){
                setTimeout(function(){
                    self.applyList();
                },self.time);
            }
        }
        for(var i=0;i<self.number;i++) {
            var content = {
                applyName : self.applyListSumCount,
                msg : new Date()
            }
            this.send("/friends/request/list", "GET", content, function () {
                self.applyListSuccessCount++;
                self.applyListSumCount++;
                $("#applyListAccessCount").text(self.applyListSuccessCount);
                setText();
            }, function () {
                self.applyListErrorCount++;
                self.applyListSumCount++;
                $("#applyListErrorCount").text(self.applyListErrorCount);
                setText()
            })
        }
    }
    //获取消息列表
    Mod.prototype.messageList = function(){
        var self = this;
        var setText = function(){
            if(self.messageListSumCount>=self.count){
                var date = new Date().getTime();
                var cha = (date-self.date)/1000;
                $("#messageListTime").text(cha);
            }
            if(self.messageListSumCount<self.count){
                setTimeout(function(){
                    self.messageList();
                },self.time);
            }
        }
        for(var i=0;i<self.number;i++) {
            this.send("/friends/message/list", "GET", {}, function () {
                self.messageListSuccessCount++;
                self.messageListSumCount++;
                $("#messageListAccessCount").text(self.messageListSuccessCount);
                setText();
            }, function () {
                self.messageListErrorCount++;
                self.messageListSumCount++;
                $("#applyListErrorCount").text(self.messageListErrorCount);
                setText()
            })
        }
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
        return signValue;
    }
    return Mod;
})($)