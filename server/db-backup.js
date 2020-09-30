'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (env === 'development') {
  require('babel-register');
}

var config = require('./config/environment');
var path = require('path');
var moment = require('moment');
var fs = require('fs');
var Mailer = require('./components/Mailer');
var dbName = 'db-' + moment().format('YYYY-MM-DD-HH-mm') + '.tar.gz';
var folderName = 'db-' + moment().format('YYYY-MM-DD-HH-mm');
var folderPath = path.join(__dirname, '..', 'db-backup', folderName);
var filePath = path.join(__dirname, '..', 'db-backup', dbName);
var AWSS3 = require('./components/AWSS3');
var exec = require('child_process').exec;
var db = 'xmember-prod';
var dumpCommand = 'mongodump --db ' + db + ' --gzip --out ' + folderPath;
var tarCommand = 'tar -czf ' + filePath + ' ' + folderPath;
var removeFolderCommand = 'rm -rf ' + folderPath;
exec(dumpCommand, function(err) {
  if (err) {
    console.log('Dump error!');
    return process.exit();
  }

  exec(tarCommand, function(err) {
    if (err) {
      console.log('Tar error!', err);
      return process.exit();
    }

    AWSS3.uploadFile({
      filePath: filePath,
      fileName: dbName,
      contentType: 'applicaton/x-gtar',
      ACL: 'public-read'
    }, function(err, result) {
      if (err) {
        console.log('Upload error!');
        process.exit();
      }

      Mailer.send({
        to: [config.adminEmail],
        subject: 'DB back up ' + moment().format('YYYY-MM-DD-HH-mm') + ' - ' + config.siteName,
        html: 'DB back up ' + moment().format('YYYY-MM-DD-HH-mm') + ' - ' + config.siteName + ' ' + config.baseUrl + ' <br />' +
              'Please download here <a href="' + result.url + '">' + result.url + '</a>'
      }, function(err) {
        if (err) {
          console.log('Send email error!', err);
        }

        exec(removeFolderCommand, function() {
          fs.unlink(filePath, function() {
            process.exit();
          });
        });
      });
    });
  });
});
