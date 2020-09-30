'use strict';

import { PageModel } from '../../models';
import { PageBusiness } from '../../businesses';
import { PageValidator, parseJoiError } from '../../validators';
import passport from 'passport';
import { S3, GM, Uploader } from '../../components';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import async from 'async';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
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

class PageController {
  /**
   * Get list of Pages
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
			req.query.limit = parseInt(req.query.limit);
		}
		if(req.query.offset!='undefined'){
			req.query.offset = parseInt(req.query.offset);
		}
    return PageBusiness.find(req.query)
      .then(pages => {
        res.status(200).json(pages);
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Page
   */
  static create(req, res, next) {
    PageValidator.validateCreating(req.body).then(data => {
      return PageBusiness.create(data,req.user).then(function(page) {
        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return  cb();
            }
            
            page.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              _.merge(page, result);
              cb();
            });
          }
        ], function() {
          PageBusiness.update(page)
            .then(() => res.status(200).json(page))
            .catch(err => validationError(res, 422)(parseJoiError(err)));
        });
      });
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Get a single Page
   */
  static show(req, res, next) {
    let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
    let query = checkForHexRegExp.test(req.params.id) ? { _id: req.params.id } : { alias: req.params.id };
    PageBusiness.findOne(query)
    .then(page => {
      if (!page) {
        return res.status(404).end();
      }
      res.json(page);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single Page
   */
  static update(req, res, next) {
    PageValidator.validateUpdating(req.body).then(data => {
      return PageBusiness.findOne({_id: req.params.id}).then(page => {
        page.name = req.body.name;
        page.description = req.body.description;
        page.sort = req.body.sort;
        page.status = req.body.status;
        
        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return  cb();
            }
            
            page.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              _.merge(page, result);
              cb();
            });
          }
        ], function() {
          PageBusiness.update(page)
            .then(() => res.status(200).json(page))
            .catch(err => validationError(res, 422)(parseJoiError(err)));
        });
      });
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Deletes a Page
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    PageBusiness.findOne(condition).then(
      page => {
        if(!page) {
          return res.status(404,'Not found').end();
        }
        PageBusiness.removeById(page._id)
        .then(function() {
          res.status(200,true).end();
        });
      },
      err => handleError(res)
    );
  }
}

module.exports = PageController;
