/**
 * Created by ThinkPad on 14-9-10.
 */
module.exports = {
    OK : "操作成功",
    SIGN_EXPIRE : 120000, //签名过期时间
    DEFAULT_TOKEN_EXPIRE : 24*60*60*1000,  //默认token过期时间为一天
    REDIS_EXPIRE : 24*60*60, //redis过期时间
    SIGN_ERROR : "签名错误",
    SECRET : "" ,//秘钥
//     MONGOOSE_HOST : "mongodb://192.168.1.33:27017,192.168.1.33:27018/server?replicaSet=MF&readPreference=secondaryPreferred&&slaveOk=true"",        //mongoose host
    MONGOOSE_HOST : "192.168.1.33",        //mongoose host
    REDIS_HOST : "192.168.1.33",        //redis host
    REDIS_PORT : 6379,
    MONGOOSE_DATABASE : "server",     //mongoose库名
    REDIS_EXPIRES : 86400,    //redis过期时间一天,单位秒
    DEFAULT_PAGENO: 1,  //默认页码
    DEFAULT_PAGEENTRIES: 20,    //默认一页显示记录数
    MAIL : {
        USERNAME : "750912340@qq.com",
        PASSWORD : "CHENWENguanggun8",
        HOST : "smtp.qq.com",//邮件服务器
        PORT : "25",//邮件服务器端口smtp.iofamily.com
        PROTOCOL : "SMTP", //发送协议
        SECURE_CONNECTION : false//使用ssl
    }
}