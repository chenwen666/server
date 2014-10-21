/**
 * Created by chenwen on 14-9-10.
 */
module.exports = {
    OK : 200, //操作成功
    MISSING_PARAMTER : 1000, //缺少参数
    SIGN_AREADY_OVERDUE : 1020, //签名已过期
    SIGN_ERROR : 1040,    //签名错误
    SYSTEM_ERROR : 1060,    //系统错误
    USERS : {
        USERNAME_NOT_EXISTS : 1080, //用户名不存在
        PASSWORD_ERROR : 1100,   //密码错误
        NOT_LOGIN : 1120,     //用户未登陆
        NOT_EXIST:1122,  //用户不存在
        USERNAME_ALREADY_REGIST : 1124,  //用户已注册
        EMAIL_EXIST : 1126,     //邮箱被战占用
        MOBILE_EXIST : 1128,    //手机号被占用
        EMAIL_NOT_BIND : 1130    //邮箱未绑定
    },
    TOKEN : {
        NOT_EXIST : 1140,  //缺少token参数
        ALREADY_EXPIRE : 1160 , //token已过期
        INVALID : 1180    //无效的token
    },
    FRIEND : {
        EXIST : 1200,  //好友已存在
        NOT_EXIST : 1220 //好友不存在
    },
    APPLY : {
        NOT_EXIST:1400,  //请求不存在
        TARGET_NOT_EXIST: 1420 //目标不存在
    },
    CONNECTION : {
        NOT_BUILD : 1600  //连接未建立
    }
}