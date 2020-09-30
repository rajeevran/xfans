const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const _ = require('lodash');
const bucket = 'siteName';
const region = 'us-east-2';

AWS.config.region = process.env.AWS_REGION || region;
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY || 'AKIAISB6TO2D6B4BYL2Q';
AWS.config.secretAccessKey = process.env.AWS_SECRET_KEY || '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';

//AWS.config.sslEnabled = true;
const s3 = new AWS.S3();

function getPublicUrl(key) {
  return 'https://' + bucket + '.s3-' + region + '.amazonaws.com/' + key;
}

exports.getPublicUrl = getPublicUrl;

exports.uploadFile = function(options, cb) {
  let filePath = options.filePath;
  let fileName = options.fileName;
  let contentType = options.contentType || 'video/mp4';

  s3.upload({
    Bucket: bucket,
    Key: fileName,
    Body: fs.createReadStream(filePath),
    ContentType: contentType
  }, function (err, res) {
    var key = fileName;
    if (err) {
      return cb(err);
    }

    return cb(null, {
      key: key,
      bucket: bucket,
      url: getPublicUrl(key)
    });
  });
}
