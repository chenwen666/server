/**
 * 公共方法
 * Created by chenwen on 14-9-10.
 */
/**
 * 验证必须参数 返回提示消息,如果必须参数都不为空,返回空字符串
 * @param msg
 * @param args
 */
module.exports.validateParameters = function(msg, obj){
    try{
        var args = [];
        if(!(obj instanceof Array)){
            for(var key in obj){
                if(obj[key]){
                 args.push(key);
                }
            }
        }else{
            args = obj;
        }
        var content='';
        for(var i = 0; i<args.length; i++){
            if(!msg[args[i]]){
                content +=args[i]+" ";
            }
        }
        if(content) content += " is require";
        return content;
    }catch(e){
        console.log(e.stack);
    }

}
/**
 * 将时间转换为 yyyy/mm/dd hh:mm:ss格式
 * @param date
 */
module.exports.parseTime = function(date){
    var str = "";
    if(date!="null" && date!="undefined"){
        if(typeof  date == "string") date = new Date(date);
        if(!!date){
            var year = date.getFullYear();
            var month = getFullNumber(date.getMonth());
            var day = getFullNumber(date.getDate());
            var hourse = getFullNumber(date.getHours());
            var min = getFullNumber(date.getMinutes());
            var second = getFullNumber(date.getSeconds());
            str = year+"/"+month+"/"+day+" "+hourse+":"+min+":"+second;
        }
    }
    return  str;
}
function getFullNumber(number){
    if(typeof number == "number"){
        number = number>9?number+"": "0"+number;
    }
    return number;
}
/**
 *
 * @param array   数组
 * @param proName  要判断数组中的对象的属性名
 * @param name
 */
module.exports.isExistOfArray =  function(array, proName,name){
    for(var i= 0,l=array.length;i<l;i++){
        if(!!array[i] && array[i][proName] == name){
            return true;
        }
    }
    return false;
}
