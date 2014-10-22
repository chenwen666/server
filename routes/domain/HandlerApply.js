/**
 * Created by chenwen on 14-9-23.
 */
var util = require("../../util/utils");
var HandlerApply = function(opts){

}
/**
 * 从数据库返回值中构建对象
 * @param opts
 */
HandlerApply.prototype.buildFormDb = function(opts){
    if(!!opts){
        this.username = opts.u;
        this.time = util.parseTime(opts.t);
        this.type = opts.tp;
        this.state = opts.s;
        this.locationId = opts.li;
    }
    return this;
}

module.exports = HandlerApply;