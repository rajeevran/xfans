'use strict';

import { MemberShipPackageModel } from '../../models';
import { MemberShipPackageBusiness } from '../../businesses';
import { MemberShipPackageValidator, parseJoiError } from '../../validators';
import { S3, GM, Uploader } from '../../components';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import async from 'async';
import path from 'path';
import fs from 'fs';
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

class MemberShipPackageController {
  /**
   * Get list of MemberShipPackages
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
			req.query.limit = parseInt(req.query.limit);
		}
		if(req.query.offset!='undefined'){
			req.query.offset = parseInt(req.query.offset);
		}
    return MemberShipPackageBusiness.find(req.query)
      .then(memberShipPackages => {
        res.status(200).json(memberShipPackages);
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new MemberShipPackage
   */
  static create(req, res, next) {
    MemberShipPackageValidator.validateCreating(req.body).then(data => {
      return MemberShipPackageBusiness.create(data,req.user).then(function(memberShipPackage) {
        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return cb();
            }
            
            memberShipPackage.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              _.merge(memberShipPackage, result);
              
              cb();
            });
          }
        ], function() {
          if (!req.files.file) {
            return res.status(200).send(memberShipPackage);
          }
          
          MemberShipPackageBusiness.update(memberShipPackage)
            .then(() => res.status(200).json(memberShipPackage))
            .catch(err => validationError(res, 422)(parseJoiError(err)));
        });
      });
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Get a single MemberShipPackage
   */
  static show(req, res, next) {
    MemberShipPackageBusiness.findOne({_id: req.params.id})
    .then(memberShipPackage => {
      if (!memberShipPackage) {
        return res.status(404).end();
      }
      res.json(memberShipPackage);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single MemberShipPackage
   */
  static update(req, res, next) {
    MemberShipPackageValidator.validateUpdating(req.body).then(data => {
      return MemberShipPackageBusiness.findOne({_id: req.params.id}).then(memberShipPackage => {
        _.merge(memberShipPackage, _.pick(req.body, ['name', 'description', 'detail', 'numberDay', 'price', 'type', 'sort', 'status']));
        
        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return cb();
            }
            
            memberShipPackage.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              _.merge(memberShipPackage, result);
              
              cb();
            });
          }
        ], function() {
          MemberShipPackageBusiness.update(memberShipPackage)
            .then(() => res.status(200).json(memberShipPackage))
            .catch(err => validationError(res, 422)(parseJoiError(err)));
        });
      });    
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Deletes a MemberShipPackage
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    MemberShipPackageBusiness.findOne(condition).then(
      memberShipPackage => {
        if(!memberShipPackage) {
          return res.status(404,'Not found').end();
        }
        MemberShipPackageBusiness.removeById(memberShipPackage._id)
        .then(function() {
          res.status(200,true).end();
        });
      },
      err => handleError(res)
    );
  }
}

module.exports = MemberShipPackageController;
