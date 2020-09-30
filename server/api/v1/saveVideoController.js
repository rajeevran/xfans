'use strict';

import { SaveVideoModel } from '../../models';
import { SaveVideoBusiness } from '../../businesses';
import { SaveVideoValidator, parseJoiError } from '../../validators';
import passport from 'passport';
import config from '../../config/environment';
import { S3, GM } from '../../components';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { UtilsHelper } from '../../helpers';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

class saveVideoController {
  /**
   * Get list of saveVideos
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
        req.query.limit = parseInt(req.query.limit);
    }
    if(req.query.offset!='undefined'){
        req.query.offset = parseInt(req.query.offset);
    }
    return SaveVideoBusiness.find(req.query,req.user)
      .then(saveVideos => {
        res.status(200).json(saveVideos);
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new saveVideo
   */
  static create(req, res, next) {
     var mongoose = require('mongoose');

    //SaveVideoValidator.validateCreating(req.body._id).then(data => {
    SaveVideoBusiness.findOne({type:req.query.type,user: mongoose.Types.ObjectId(req.user._id), video: mongoose.Types.ObjectId(req.body._id)})
    .then(saveVideo => {
      if (!saveVideo) {
        SaveVideoBusiness.create(req.body,req.user,req.query.type).then(function(saveVideo) {
          return res.status(200).json(saveVideo);
         })
         .catch(validationError(res, 422));
      }else{
        return res.status(400).json({error:"You've added this video earlier."});
      }

    })
    .catch(err => next(err))

   // })
   // .catch(err => {
    //  validationError(res, 422)(parseJoiError(err));
    //});
  }

  /**
   * Get a single saveVideo
   */
  static show(req, res, next) {
    SaveVideoBusiness.findOne({_id: req.params.id})
    .then(saveVideo => {
      if (!saveVideo) {
        return res.status(404).end();
      }
      res.json(saveVideo);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single saveVideo
   */
  static update(req, res, next) {
    //TODO - update validator
    var saveVideoId = req.body._id;
    SaveVideoValidator.validateUpdating(req.body).then(data => {
   SaveVideoBusiness.findOne({_id: saveVideoId})
    .then(saveVideo => {
      var mongoose = require('mongoose');
      var performerId = mongoose.Types.ObjectId(req.body.performer);

        saveVideo.name = req.body.name;
        saveVideo.description = req.body.description;
        saveVideo.performer = performerId;
        saveVideo.sort = req.body.sort;
        saveVideo.filePath = req.body.filePath;
        saveVideo.fileTrailerPath = req.body.fileTrailerPath;
        saveVideo.type = req.body.type;
        saveVideo.status = req.body.status;
        if(typeof req.files.file != 'undefined'){
          var path = require('path'),
        fs = require('fs');
        var date = new Date();
        var fileName = date.getFullYear().toString() + (date.getMonth()+1).toString()
                + date.getDate().toString() + date.getHours().toString()
                + date.getMinutes().toString() + date.getSeconds().toString()
                + "_" +req.files.file.name;
        var tempPath = req.files.file.path;
        if(config.imageType=='s3'){
              var  s3Options = {
                    s3Params: {
                      ACL: 'public-read'
                    },
                    folder: "uploads/images/"+req.user._id
                  }
            S3.uploadFile(tempPath, s3Options,(err,data)=>{
              console.log(err)
              console.log(data)
            });
            var imageFullSave = "/uploads/images/users/"+req.user._id+"/"+fileName;
        }else{
          var dir = path.join(config.imageTempFolder + "/users/" +req.user._id);
          if (!fs.existsSync(dir)){
           UtilsHelper.mkdirpSync(dir,'0777');
          }
          var targetPath =  dir +"/"+fileName;
          fs.readFile(tempPath, (err, data) => {
          fs.writeFile(targetPath, data , function(err) {
                if (err) throw err;
                //console.log("Upload completed!");
            });
          });
          var imageFullSave = "/uploads/images/users/"+req.user._id+"/"+fileName;
        }
        //Set size image
        var imageSmallSize = config.imageSmallSize;
        var imageMediumSize = config.imageMediumSize;
        //Set image resize name
        var imageSmallName = "resize_" + imageSmallSize.width + "x" + imageSmallSize.height + "_" + fileName;
        var imageMediumName = "resize_" + imageMediumSize.width + "x" + imageMediumSize.height + "_" + fileName;
        //Set Path destinational
        var imageSmallPath =  dir +"/" + imageSmallName;
        var imageMediumPath =  dir +"/" + imageMediumName;
        //Setup Option resize
        var gmSmallOptions = { width: imageSmallSize.width, height: imageSmallSize.height, dest:imageSmallPath }
        var gmMediumOptions = { width: imageMediumSize.width, height: imageMediumSize.height, dest:imageMediumPath }
        //Resize Image
          GM.resize(tempPath, gmSmallOptions, (err,data)=>{
            console.log(err)
            console.log(data)
          });
          GM.resize(tempPath, gmMediumOptions, (err,data)=>{
            console.log(err)
            console.log(data)
          });
        var imageSmallSave = "/uploads/images/users/"+req.user._id + "/"+imageSmallName;
        var imageMediumSave = "/uploads/images/users/"+req.user._id + "/"+imageMediumName;

        saveVideo.imageFullPath = imageFullSave;
        saveVideo.imageMediumPath = imageMediumSave;
        saveVideo.imageThumbPath = imageSmallSave;
        }

        saveVideo.imageType = config.imageType;
        return SaveVideoBusiness.update(saveVideo)
          .then(() => {
          return  res.status(200).json(saveVideo);
          })
          .catch(validationError(res));
    });
     });
  }

  /**
   * Like saveVideo
   */
  static like(req, res, next) {
      SaveVideoBusiness.findOne({_id: req.body.id}).then(saveVideo => {
        if(!saveVideo) {
          return validationError(res, 404)({message: 'Not found'});
        }

        saveVideo.stats.totalLike = saveVideo.stats.totalLike + 1;
        SaveVideoBusiness.update(saveVideo).then(function(saveVideo) {
            return res.status(200).json(saveVideo);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });

  }

  /**
   * Deletes a saveVideo
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    SaveVideoBusiness.findOne(condition).then(
      saveVideo => {
        if(!saveVideo) {
          return res.status(404,'Not found').end();
        }
        SaveVideoBusiness.removeById(saveVideo._id)
        .then(function() {
          res.status(200,true).end();
        });
      },
      err => handleError(res)
    );
  }


  /**
   * Authentication callback
   */
  static authCallback(req, res, next) {
    res.redirect('/');
  }
}

module.exports = saveVideoController;
