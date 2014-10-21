/**
 * Created by chenwen on 14-10-13.
 */
var fs = require("fs");
var from = "C:\\Users\\ThinkPad\\AppData\\Local\\Temp\\5956-ds2pfv.bmp";
var target = "E:\\work\\server\\public\\images\\2014-09-19-0.bmp";


var path = "ab.jpg";

var suffix = path.replace(/([^\.]+)/,function(a){
    console.log(a);
    return
})