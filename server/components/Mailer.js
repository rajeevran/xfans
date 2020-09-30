import nodemailer from 'nodemailer';
import _ from 'lodash';
import path from 'path';
import  config from '../config/environment';
import sgTransport from 'nodemailer-sendgrid-transport';

var viewsPath = '../views/emails/',
  SwigEngine = require('swig').Swig,
  swig = new SwigEngine({
    varControls: ['<%=', '%>'],
    cache : 'memory'
  });

function Mailer(options) {
  this.transport = nodemailer.createTransport(options);
}

Mailer.prototype.render = function(template, options, callback) {
  if (typeof callback !== 'function') {
    callback = function() {};
  }
  
  options = options || {};
  options.siteName = config.siteName;
  
  swig.renderFile(path.join(__dirname, viewsPath, template), options || {}, callback);
};

Mailer.prototype.send = function(options, callback) {
  if (typeof callback !== 'function') {
    callback = function() {};
  }
  options = options || {};
  options.siteName = config.siteName;
  //console.log(options)
  _.defaults(options, {
    from : config.emailFrom,
    bcc : config.bccEmails || []
  });

  this.transport.sendMail(options, function(err, data) {
    callback && callback(null, data);
  });
};

Mailer.prototype.sendMail = function(template, emails, options, callback) {
  if (typeof callback !== 'function') {
    callback = function() {};
  }
  var self = this;
 // console.log(emails)
  self.render(template, options, function(err, output) {
    if (err) { return callback(err); }
    self.send({
      to : emails,
      subject : options.subject,
      html : output
    }, callback);
  });
};

Mailer.prototype.close = function() {
  this.transport.close();
};

let transport = config.sendgrid ? sgTransport({
  auth: {
    api_key: config.sendgrid.apiKey
  }
}) : config.mailer;

//export singleton
module.exports = new Mailer(transport);
