const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const _ = require('lodash');
import config from '../config/environment';
import StringHelper from '../helpers/StringHelper';

AWS.config.region = process.env.AWS_REGION || config.AWS.region;
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY || config.AWS.accessKeyId;
AWS.config.secretAccessKey = process.env.AWS_SECRET_KEY || config.AWS.secretAccessKey;

//AWS.config.sslEnabled = true;
const s3 = new AWS.S3();

function getSignedUrl(filename, options) {
  if (!filename) {
    return '';
  }
  options = options || {};
  var key = filename.replace('https://' + config.S3.bucket + '.s3-' + config.AWS.region + '.amazonaws.com/', '');

  //http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  let condition = {
    Bucket: config.S3.bucket,
    Key: key,
    Expires: options.expiresInMinutes ? options.expiresInMinutes * 60 : 2 * 60 * 60 //2h for exp link
  };
  if (options.forceDownload) {
    condition.ResponseContentDisposition = 'attachment;filename=' + key;
  }
  return s3.getSignedUrl('getObject', condition);
}

function getPublicUrl(key) {
  return 'https://' + config.S3.bucket + '.s3-' + config.AWS.region + '.amazonaws.com/' + key;
}

exports.getSignedUrl = getSignedUrl;

exports.getPublicUrl = getPublicUrl;

exports.uploadFile = function(options, cb) {
  let filePath = options.filePath;
  let fileName = options.fileName;
  let contentType = options.contentType || 'video/mp4';
  let ACL = options.ACL || 'private';

  if (!fs.existsSync(filePath)) {
    filePath = path.join(config.fileTempFolder, filePath);
  }

  s3.upload({
    Bucket: config.S3.bucket,
    Key: fileName,
    Body: fs.createReadStream(filePath),
    ContentType: contentType,
    ACL: ACL
  }, function (err, res) {
    var key = fileName;
    if (err) {
      return cb(err);
    }

    return cb(null, {
      key: key,
      bucket: config.S3.bucket,
      url: getPublicUrl(key)
    });
  });
};

exports.getKey = function(filename) {
  if (!filename) {
    return '';
  }
  return filename.replace('https://' + config.S3.bucket + '.s3-' + config.AWS.region + '.amazonaws.com/', '');
};
