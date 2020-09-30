import config from '../config/environment';
import {StringHelper} from '../helpers';
import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import cb2Promise from 'promisify-node';
import _ from 'lodash';

AWS.config.region = config.AWS.region;
AWS.config.accessKeyId = config.AWS.accessKeyId;
AWS.config.secretAccessKey = config.AWS.secretAccessKey;
//AWS.config.sslEnabled = true;
var s3 = new AWS.S3();

function getSignedUrl(filename, options) {
  options = options || {};

  //http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  return s3.getSignedUrl('getObject', {
    Bucket: config.S3.bucket,
    Key: filename,
    Expires: options.expiresInMinutes || 60
  });
}

/**
 * upload file to S3
 * @param  {String}   filePath path to local file
 * @param  {object}   options  null or object, optional
 * allow params
 * {
 *   S3Params: {} //params object in S3, see more http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
 *   folder: string to folder, this options will create a new folder in aws, after that add to filenam
 * }
 * @param  {Function} cb       Callback function
 * @return {void}
 */
function uploadFile(filePath, options, cb) {
  var filename = path.parse(filePath).base;
  var ext = filename.split('.').pop();

  if (arguments.length === 2) {
    cb = options;
    options = {};
  } else {
    options = options || {};
  }

  //create slug from file name, remove ext
  //remove ext
  // 1) convert to lowercase
  // 2) remove dashes and pluses
  // 3) remove everything but alphanumeric characters and dashes
  // 4) replace spaces with dashes
  filename = options.filename || Math.random().toString(36).substring(7) + '-' + filename
            .replace(/\.[^/.]+$/, "")
            .toLowerCase().replace(/-+/g, '')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/\s+/g, '-') + '.' + ext;

  var body = fs.createReadStream(filePath);
  //http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  var params = _.merge({
    Bucket: config.S3.bucket,
    Key: filename,
    Body: fs.createReadStream(filePath),
    ContentType: StringHelper.getContentType(ext)
  }, options.s3Params);

  //check options to add folder to aws s3
//  var folder = '';
//  if (options.folder) {
//    folder = options.folder.charAt(0) === '/' ? options.folder.replace('/', '') : options.folder;
//    params.Bucket += (options.folder.charAt(0) === '/' ? '' : '/') + options.folder;
//  }

  s3.putObject(params, function (err, res) {
    var key = filename;
    if (err) {
      return cb(err);
    } else {
      return cb(null, {
        key: key,
        bucket: config.S3.bucket,
        signedUrl: getSignedUrl(key),
        url:getPublicUrl(key)
      });
    }
  });
}

/**
 * delete S3 file
 * @param  {String/Array}   key filename
 * @param  {Function} cb
 * @return {Promise}
 */
function deleteFile(keys, cb) {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  var params = {
    Bucket: config.S3.bucket,
    Delete: {
      Objects: keys.map(function(key) {
        return { Key: key };
      })
    }
  };

  if (cb) {
    s3.deleteObjects(params, cb);
  } else {
    return cb2Promise(s3.deleteObjects)(params);
  }
}

function getPublicUrl(key) {
  return 'https://' + config.S3.bucket + '.s3.amazonaws.com/' + key;
}

/**
 * get s3 public url with exp time
 * @param  {String} filename         S3 file name
 * @param  {Integer} expiresInMinutes minutes
 * @return {String}                  Url to the file
 */
exports.getSignedUrl = getSignedUrl;

/**
 * upload file to S3 from file path
 * @param  {String}   filePath absolute path to the file
 * @param  {Function} cb       callback function
 */
exports.uploadFile = uploadFile;

exports.deleteFile = deleteFile;

/**
 * get public url if file is public-read ACL
 * @type {String}
 */
exports.getPublicUrl = getPublicUrl;

exports.s3 = s3;
