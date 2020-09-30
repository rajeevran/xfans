'use strict';

import { PhotoModel, PerformerAlbumModel } from '../../models';
import { PhotoBusiness } from '../../businesses';
import { PhotoValidator, parseJoiError } from '../../validators';
import passport from 'passport';
import { Uploader, S3, GM } from '../../components';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import async from 'async';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

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

class PhotoController {
  /**
   * Get list of Photos
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
        req.query.limit = parseInt(req.query.limit);
    }
    if(req.query.offset!='undefined'){
        req.query.offset = parseInt(req.query.offset);
    }
    return PhotoBusiness.find(req.query)
      .then(photos => {
        if (_.isNumber(photos)) {
          return res.status(200).json(photos);
        }
        //res.status(200).json(photos);
        let results = [];

        async.eachLimit(photos, 3, function(photo, cb) {
          let item = photo.toJSON();
          if (photo.performerAlbumIds && photo.performerAlbumIds.length) {
            PerformerAlbumModel.find({
              _id: {
                $in: photo.performerAlbumIds
              }
            }, function(err, albums) {
              item.performerAlbums = err ? [] : albums;
              results.push(item);
              cb();
            });
          } else {
            item.performerAlbums = [];
            results.push(item);
            cb();
          }
        }, function(err) {
          if (err) {
            return res.status(500).send(err);
          }

          results.map(item => {
            if (!req.user) {
              item.imageFullPath = '';
            }
          });

          res.status(200).send(results);
        });
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Photo
   */
  static create(req, res, next) {
    PhotoValidator.validateCreating(req.body).then(data => {
      data.images = [];

      async.eachOf(req.files.file, (file, index, callback) => {
        data.imageType = config.imageType;
        if (!index) {
          let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
          Func(file, req.user._id, (err, result) => {
            _.merge(data, result);
            if (result.imageFullPath) {
              data.images.push(result.imageFullPath);
            }
            callback();
          });
        } else {
          let Func = config.imageType == 's3' ? Uploader.uploadImageToS3 : Uploader.uploadImage;
          Func(file, req.user._id, (err, image) => {
            if (!err) {
              data.images.push(image);
            }

            callback();
          });
        }
      }, function(err) {
        PhotoBusiness.create(data, req.user).then(photo => {
          return  res.status(200).json(photo);
        }).catch(err => validationError(res, 422)(parseJoiError(err)));
      });
    })
    .catch(err => res.status(400).send(err));
  }

  /**
   * Get a single Photo
   */
  static show(req, res, next) {
    PhotoBusiness.findOne({_id: req.params.id})
    .then(photo => {
      if (!photo) {
        return res.status(404).end();
      }

      if (!req.user) {
        photo.imageFullPath = '';
      }
      res.json(photo);
    })
    .catch(err => next(err));
  }

  /**
   * Get a single Photo
   */
  static update(req, res, next) {
    PhotoValidator.validateUpdating(req.body).then(data => {
      return PhotoBusiness.findOne({_id: req.params.id}).then(photo => {
        _.assign(photo, _.pick(req.body, [
          'name', 'description', 'metaKeywords', 'metaDescription', 'metaTitle', 'images',
          'performer', 'sort', 'status', 'imageType'
        ]));
        photo.performerAlbumIds = _.filter(req.body.performerAlbumIds, id => id) || [];
        if (!photo.images) {
          photo.images = [];
        }

        async.eachOf(req.files.file, (file, index, callback) => {
          photo.imageType = config.imageType;
          if (!index) {
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(file, req.user._id, (err, result) => {
              _.assign(photo, result);
              if (result.imageFullPath) {
                photo.images = [result.imageFullPath];
              }
              callback();
            });
          } else {
            let Func = config.imageType == 's3' ? Uploader.uploadImageToS3 : Uploader.uploadImage;
            Func(file, req.user._id, (err, image) => {
              if (!err) {
                photo.images = [image];
              }

              callback();
            });
          }
        },function(err){
            return PhotoBusiness.update(photo)
              .then((photo) => res.status(200).json(photo));
          }
        );
      });
    }).catch(err => res.status(400).send(err));
  }

  /**
   * Deletes a Photo
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    PhotoBusiness.findOne(condition).then(
      photo => {
        if(!photo) {
          return res.status(404,'Not found').end();
        }
        photo.remove();
        res.status(200,true).end();
      },
      err => handleError(res)
    );
  }

  /**
   * Get list of Photos for drop down
   */
  static all(req, res) {
    return PhotoModel.find({}, 'name').sort('name').exec()
      .then(photos => {
        res.status(200).json(photos);
      })
      .catch(handleError(res));
  }

  static search(req, res) {
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 10;
    let query = {};
    if (req.query.performerId) {
      query.performer = {
        $in: [req.query.performerId]
      };
    }

    if (req.query.albumId && req.query.albumId !== 'others') {
      query.performerAlbumIds = {
        $in: [req.query.albumId]
      };
    } else if (req.query.albumId === 'others' && req.query.performerId) {
      query.$and = [
        {
          $or: [
            {
              performerAlbumIds: null
            },
            {
              performerAlbumIds: {
                $exists: false
              }
            },
            {
              performerAlbumIds: {
                $size: 0
              }
            }
          ]
        },
        {
          performerAlbumIds: {
            $nin: [req.query.performerId]
          }
        }
      ];
    }

    //check active album first
    async.waterfall([
      function(cb) {
        if (req.query.albumId && req.query.albumId !== 'others' && (!req.user || req.user && req.user.role !== 'admin')) {
          PerformerAlbumModel.count({
            isActive: {
              $ne: false
            },
            _id: req.query.albumId
          }, function(err, count) {
            return cb(null, !err && count);
          });
        } else {
          cb(null, true);
        }
      }
    ], function(err, doQuery) {
      if (err || !doQuery) {
        return res.status(200).json({
          count: 0,
          items: []
        });
      }

      async.parallel({
        count(cb) {
          PhotoModel.count(query, cb);
        },
        items(cb) {
          PhotoModel.find(query)
            .sort({ createdAt: -1 })
            .skip(page * take)
            .limit(take)
            .exec(function(err, items) {
              if (err) {
                return cb(err);
              }

              items.map(item => {
                if (!req.user) {
                  item.imageFullPath = '';
                }
              });

              cb(null, items);
            });
        }
      }, (err, result) => {
        if (err) { return res.status(500).send(err); }

        res.status(200).json(result);
      });
    });
  }
}

module.exports = PhotoController;
