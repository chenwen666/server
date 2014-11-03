/**
 * Created by ThinkPad on 14-10-17.
 */
var express = require('express');
var path = require('path');
var fs = require("fs");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var Code = require("./config/Code");
var SystemConfig = require("./config/SystemConfig");
var routes = require('./routes/index');
var friendRoute = require('./routes/friendRoute');
var oauth2Route = require('./routes/oauth2Route');
var log = require("./util/logger");
var situationRoute = require("./routes/situationRoute");

var https = require('https');
var key = fs.readFileSync('./key/server_nopass.key');
var cert = fs.readFileSync('./key/server.crt');
var https_options = {
    key: key,
    cert: cert
};

var app = express();


// view engine setup
/*
app.set('views', path.join(__dirname, 'views'));
app.engine('html',require("ejs").renderFile);
app.set('view engine', 'html');
*/
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store : new RedisStore({
        host : SystemConfig.REDIS_HOST,
        port : SystemConfig.REDIS_PORT,
        ttl : SystemConfig.REDIS_EXPIRES
    }),
    secret : "server"
}))
app.use(express.static(path.join(__dirname, 'public')));
//app.use(bodyParser({uploadDir:"./uploads"}));
app.use(require('connect-multiparty')({uploadDir:"./uploads"}));
//app.use('/', routes);
app.use('/oauth2', oauth2Route);
app.use('/friends', friendRoute);
app.use("/test",require("./routes/test"));
app.use("/user",require("./routes/userRouter"));
app.use(situationRoute);

app.use(function(req, res, next) {
    res.send({code:404,msg:"not found"});
});
// catch 404 and forward to error handler
// error handlers
// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
// production error handler
// no stacktraces leaked to user

server = https.createServer(https_options, app).listen(3000,function(){
    log.info('Express server listening on port ' + server.address().port);
});
module.exports = app;
