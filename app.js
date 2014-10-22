var express = require('express');
var path = require('path');
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
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html',require("ejs").renderFile);
app.set('view engine', 'html');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store : new RedisStore({
        host : "127.0.0.1",
        port : 6379,
        ttl : SystemConfig.REDIS_EXPIRES,
        db : 1
    }),
    secret : "server"
}))
app.use(express.static(path.join(__dirname, 'public')));
//app.use(bodyParser({uploadDir:"./uploads"}));
app.use(require('connect-multiparty')({uploadDir:"./uploads"}));

app.use('/', routes);
app.use('/oauth2', oauth2Route);
app.use('/friends', friendRoute);
app.use("/test",require("./routes/test"));
app.use("/user",require("./routes/userRouter"));
app.use(situationRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.send({code:404,msg:"not found"});
});
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
var server = app.listen(3000, function() {
    log.info('Express server listening on port ' + server.address().port);
});
module.exports = app;
