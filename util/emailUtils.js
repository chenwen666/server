var nodemailer = require('nodemailer');
var SystemConfig = require('../config/SystemConfig');
var utils = require('../util/utils');
var log = require('../util/logger');

var emailUtils = module.exports;

//初始化nodemailer
var transport = nodemailer.createTransport(SystemConfig.MAIL.PROTOCOL,
  {
	  host: SystemConfig.MAIL.HOST,
	  secureConnection: SystemConfig.MAIL.SECURE_CONNECTION, // use SSL
	  port: SystemConfig.MAIL.PORT, // port for secure SMTP'
	  auth: {
		  user: SystemConfig.MAIL.USERNAME,
		  pass: SystemConfig.MAIL.PASSWORD
	  }
  });
log.info('SMTP Configured');

emailUtils.send = function(email,subject,content,cb) {
	try {
		// Message object
		var message = {
			from: SystemConfig.MAIL.USERNAME,
			to: email,
			subject: subject, //标题
			headers: {
				'X-Laziness-level': 1000
			},
			// HTML body
			html:content
		};
		log.info('Sending Mail send to %s',email);
		transport.sendMail(message, function(err){
			if(err){
				log.error('Send mail error occured %s',err.stack);
			}
			log.info('Message sent successfully!');
		});
        cb();
	} catch(e) {
		log.error('邮件发送失败 %s', e.stack)
		cb(e);
	}
}