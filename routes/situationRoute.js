/**
 * Created by chenwen on 14-9-17.
 */
var express = require('express');
var router = express.Router();
var utils = require("../util/utils");
var requestUtils = require("../util/requestUtils");
var log = require("../util/logger.js");
var Code = require("../config/Code.js");
var SystemConfig = require("../config/SystemConfig");
var situationService = require("./services/situationService");
var auth = require("./auth/auth");

router.post("/situation",auth.authLogin,auth.friendAuth(),function(req, res){
    var msg = utils.validateParameters(req.body,["devId"]);
    if(msg) return requestUtils.send(req, res, Code.MISSING_PARAMTER, msg);
    situationService.findById(req.body,function(err, doc, device){
        if(err) return requestUtils(res, Code.SYSTEM_ERROR);
        requestUtils.send(req,res,Code.OK,{situation:doc,device:device});
    });
});

module.exports = router;


