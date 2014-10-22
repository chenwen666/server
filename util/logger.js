/**
 * 日志
 * Created by chenwen on 2014/7/14.
 */
var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'dateFile',
            absolute: true,
            filename: process.cwd() + '/logs/access.log',
            maxLogSize: 10 * 1024,
            backup: 3,
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: true,
            category: 'normal'
        }
    ],
    replaceConsole: true
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');
module.exports = logger;