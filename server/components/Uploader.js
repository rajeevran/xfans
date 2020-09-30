'use strict';

import async from 'async';
import fs from 'fs';
import path from 'path';
import GM from './GM';
import AWSS3 from './AWSS3';
import Queue from './Queue';
import TmpFile from '../models/tmpFile';
import StringHelper from '../helpers/StringHelper';
import config from '../config/environment';
import { UtilsHelper } from '../helpers';
var mv = require('mv');

class Uploader {

  static uploadImageWithThumbnails(file, email, cb){
    if (!file) {
      return cb();
    }
    var date = new Date();
    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);

    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var tempPath = file.path;
    var dir = path.join(config.imageTempFolder + "/users/" + email);
    //Set size image
    var imageSmallSize = config.imageSmallSize;
    var imageMediumSize = config.imageMediumSize;
    //Set image resize name
    var imageSmallName = "resize_" + imageSmallSize.width + "x" + imageSmallSize.height + "_" + fileName;
    var imageMediumName = "resize_" + imageMediumSize.width + "x" + imageMediumSize.height + "_" + fileName;
    //Set Path destinational
    var imageThumbPath =  dir +"/" + imageSmallName;
    var imageMediumPath =  dir +"/" + imageMediumName;
    //Setup Option resize
    var gmSmallOptions = { width: imageSmallSize.width, height: imageSmallSize.height, dest:imageThumbPath };
    var gmMediumOptions = { width: imageMediumSize.width, height: imageMediumSize.height, dest:imageMediumPath };

    if (!fs.existsSync(dir)){
      UtilsHelper.mkdirpSync(dir,'0777');
    }

    var fileFullPath = dir + "/" + fileName;
    async.auto({
      imageFullPath: function(callback){
        mv(tempPath, fileFullPath, function(err) {
          if (err) {
            return cb(err);
          }

          callback(null, "/uploads/images/users/"+email+"/"+fileName);
        });
      },
      imageThumbPath: ['imageFullPath', function(result, callback){
        GM.resize(fileFullPath, gmSmallOptions, (err,data)=>{
          if (err) {
            return callback(err);
          }
          callback(null, "/uploads/images/users/"+email + "/"+imageMediumName);
        });
      }],
      imageMediumPath: ['imageThumbPath', function(result, callback){
        GM.resize(fileFullPath, gmMediumOptions, (err,data)=>{
          if(err){
            return callback(err);
          }
          callback(null, "/uploads/images/users/"+email + "/"+imageSmallName);
        });
      }]
    }, function(err, result){
      cb(err, result);
    });
  }

  static uploadImage(file, email, cb){
    if (!file) {
      return cb();
    }

    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);
    var date = new Date();
    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var dir = path.join(config.imageTempFolder + "/users/" + email);
    if (!fs.existsSync(dir)){
      UtilsHelper.mkdirpSync(dir,'0777');
    }
    mv(file.path, dir +"/"+fileName, (err, data) => {
      if (err) {
        return cb(err);
      }
      cb(null, "/uploads/images/users/"+email+"/"+fileName);
    });
  }

  static uploadImageToS3(file, email, cb){
    if (!file) {
      return cb();
    }
    var date = new Date();
    var fileName = date.getFullYear().toString() + (date.getMonth()+1).toString()
      + date.getDate().toString() + date.getHours().toString()
      + date.getMinutes().toString() + date.getSeconds().toString()
      + "_" +file.name;
    var dir = path.join(config.imageTempFolder + "/users/" + email);
    if (!fs.existsSync(dir)){
      UtilsHelper.mkdirpSync(dir,'0777');
    }

    let filePath = dir +"/"+fileName;
    mv(file.path, filePath, function(err, data) {
      if (err) {
        return cb(err);
      }

      Queue.create('UPLOAD_S3', {
        filePath: filePath,
        fileName: fileName,
        ACL: 'public-read',
        contentType: 'image/png'
      })
      .save(() => {
        TmpFile.create({
          filePath: filePath
        });
        cb(null, AWSS3.getPublicUrl(fileName));
      });
    });
  }

  //TODO - should convert mp4 file?
  static uploadFile(file, cb) {
    if (!file) {
      return cb();
    }
    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);
    var date = new Date();
    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var dir = path.join(config.fileTempFolder);
    if (!fs.existsSync(dir)) {
      UtilsHelper.mkdirpSync(dir,'0777');
    }
    mv(file.path, dir +"/"+fileName, function(err) {
      if (err) {
        return cb(err);
      }

      cb(null, "/uploads/files/" + fileName);
    });
  }

  static uploadFileS3(file, cb) {
    if (!file) {
      return cb();
    }

    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);
    var date = new Date();
    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var dir = path.join(config.fileTempFolder);
    if (!fs.existsSync(dir)) {
      UtilsHelper.mkdirpSync(dir,'0777');
    }
    var filePath = dir +"/"+fileName;
    mv(file.path, dir +"/"+fileName, function(err) {
      if (err) {
        return cb(err);
      }

      Queue.create('UPLOAD_S3', {
        filePath: filePath,
        fileName: fileName,
        ACL:'public-read',
        contentType: StringHelper.getContentType(StringHelper.getExt(fileName))
      })
      .save(() => cb(null, AWSS3.getPublicUrl(fileName)));
    });
  }

  static uploadImageWithThumbnailsToS3(file, email, cb) {
    if (!file) {
      return cb();
    }

    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);
    var date = new Date();
    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var tempPath = file.path;
    var dir = path.join(config.imageTempFolder + "/users/" + email);

    if (!fs.existsSync(dir)) {
      UtilsHelper.mkdirpSync(dir, '0777');
    }

    //Set size image
    var imageSmallSize = config.imageSmallSize;
    var imageMediumSize = config.imageMediumSize;
    //Set image resize name
    var imageSmallName = "resize_" + imageSmallSize.width + "x" + imageSmallSize.height + "_" + fileName;
    var imageMediumName = "resize_" + imageMediumSize.width + "x" + imageMediumSize.height + "_" + fileName;
    //Set Path destinational
    var imageThumbPath =  dir +"/" + imageSmallName;
    var imageMediumPath =  dir +"/" + imageMediumName;
    //Setup Option resize
    var gmSmallOptions = { width: imageSmallSize.width, height: imageSmallSize.height, dest:imageThumbPath };
    var gmMediumOptions = { width: imageMediumSize.width, height: imageMediumSize.height, dest:imageMediumPath };

    async.auto({
      imageFullPath: function(cb) {
        Queue.create('UPLOAD_S3', {
          filePath: tempPath,
          fileName: fileName,
          ACL: 'public-read',
          contentType: 'image/png'
        })
        .save(() => {
          TmpFile.create({
            filePath: tempPath
          });
          cb(null, AWSS3.getPublicUrl(fileName));
        });
      },
      imageThumbPath: function(cb) {
        GM.resize(tempPath, gmSmallOptions, (err, data) => {
          if (err) {
            return cb();
          }
          Queue.create('UPLOAD_S3', {
            filePath: data.path,
            fileName: imageSmallName,
            ACL: 'public-read',
            contentType: 'image/png'
          })
          .save(() => {
            TmpFile.create({
              filePath: data.path
            });
            cb(null, AWSS3.getPublicUrl(imageSmallName));
          });
        });
      },
      imageMediumPath: function(cb) {
        GM.resize(tempPath, gmMediumOptions, (err, data) => {
          if (err) {
            return cb();
          }
          Queue.create('UPLOAD_S3', {
            filePath: data.path,
            fileName: imageMediumName,
            ACL: 'public-read',
            contentType: 'image/png'
          })
          .save(() => {
            TmpFile.create({
              filePath: data.path
            });
            cb(null, AWSS3.getPublicUrl(imageMediumName));
          });
        });
      }
    }, function(err, results) {
      //TODO - fix error
      cb(null, results);
    });
  }

  static queueUploadFile(options, cb) {
    Queue.create('UPLOAD_S3', {
      filePath: options.filePath,
      fileName: options.fileName,
      ACL: options.ACL || 'public-read',
      contentType: options.contentType || 'video/mp4'
    })
    .save(() => cb(null, AWSS3.getPublicUrl(fileName)));
  }
}

module.exports = Uploader;
