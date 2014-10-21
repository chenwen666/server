/**
 * Created by chenwen on 14-9-23.
 */
var utils = require("../../util/utils");
var Device = function(){
}
/**
 * 从数据库返回值中构建对象
 * @param opts
 */
Device.prototype.buildFormDb = function(opts){
    if(!!opts){
        this.id = opts.id;
        this.maintenance = opts.m;
        this.pid = opts.pid;
        this.coordinate = opts.v;
        this.nearDevices = opts.n;
        this.fristTime = opts.t;
        this.lastTime = opts.lt;
        this.state = opts.s;
        this.batteryState = opts.bs;
    }
    return this;
}
module.exports = Device;