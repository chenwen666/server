/**
 * Created by ThinkPad on 14-9-11.
 */
var helper = (function(){
    var mod = {};
    mod.getSign = function(paramArgs, msg){
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
    return mod;
})()
