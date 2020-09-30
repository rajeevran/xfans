'use strict';

import { BannerModel } from '../../models';
import { BannerBusiness } from '../../businesses';
import { BannerValidator, parseJoiError } from '../../validators';
import { S3, GM, Uploader } from '../../components';
import config from '../../config/environment';
import _ from 'lodash';
import async from 'async';

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

class BannerController {
  /**
   * Get list of Banners
   */
  static index(req, res) {
	if(req.query.limit!='undefined'){
        req.query.limit = parseInt(req.query.limit);
    }
    if(req.query.offset!='undefined'){
        req.query.offset = parseInt(req.query.offset);
    }
    return BannerBusiness.find(req.query)
      .then(banners => {
        res.status(200).json(banners);
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Banner
   */
  static create(req, res, next) {
    BannerValidator.validateCreating(req.body).then(data => {
      return BannerBusiness.create(data, req.user).then(function(banner) {
        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return cb();
            }

            banner.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              if (err) {
                return res.status(400).send(err);
              }

              _.merge(banner, result);
              cb();
            });
          }
        ], function() {
          if (!req.files.file) {
            return res.status(200).send(banner);
          }

          BannerBusiness.update(banner)
          .then((banner) => res.status(200).json(banner))
        });
      });
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Get a single Banner
   */
  static show(req, res, next) {
    BannerBusiness.findOne({_id: req.params.id})
    .then(banner => {
      if (!banner) {
        return res.status(404).end();
      }
      res.json(banner);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single Banner
   */
  static update(req, res, next) {
    BannerValidator.validateUpdating(req.body).then(data => {
      return BannerBusiness.findOne({_id: req.params.id}).then(banner => {
        _.assign(banner, _.pick(req.body, ['imageType', 'name', 'description', 'link', 'sort', 'status']));

        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return cb();
            }

            banner.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              if (err) {
                return res.status(400).send(err);
              }

              _.merge(banner, result);
              cb();
            });
          }
        ], function() {
          return BannerBusiness.update(banner)
          .then((banner) => res.status(200).json(banner))
        });
      });
    })
    .catch(err => res.status(400).send(err));
  }

  /**
   * Deletes a Banner
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    BannerBusiness.findOne(condition).then(
      banner => {
        if(!banner) {
          return res.status(404,'Not found').end();
        }
        BannerBusiness.removeById(banner._id)
        .then(function() {
          res.status(200,true).end();
        });
      }
    ).catch(err => res.status(400).send(err))
  }
}

module.exports = BannerController;
