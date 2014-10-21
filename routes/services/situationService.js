/**
 * Created by chenwen on 14-9-17.
 */
var situationDao = require("../dao/situationDao");
/**
 * 根据ID查询
 * @param id
 * @param cb
 */
exports.findById = function(msg ,cb){
    var devId = msg.devId;
    situationDao.findByDeviceId(devId, cb);
}
