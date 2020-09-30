'use strict';

import { CommentModel, VideoModel } from '../../models';
import { CommentBusiness, PerformerBusiness, UserBusiness } from '../../businesses';
import { VideoBusiness } from '../../businesses';
import { CommentValidator, parseJoiError } from '../../validators';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import async from 'async';
import _ from 'lodash';
import Promise from 'promise';
import moment from 'moment-timezone';
let dateChunk = require('chunk-date-range');

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

class CommentController {
  /**
   * Get list of Comments
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
        req.query.limit = parseInt(req.query.limit);
    }
    if(req.query.offset!='undefined'){
        req.query.offset = parseInt(req.query.offset);
    }
    return CommentBusiness.find(req.query)
      .then(comments => {
        res.status(200).json(comments);
      })
      .catch(handleError(res));
  }
  /**
   * Get list of Comments by Type
   */
  static searchByType(req, res) {
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 10;
    let query = {};
    if (req.query.payoutId) {
      query.payout = {
        $in: [req.query.payoutId]
      };
    }
    async.parallel({
        count(cb) {
          CommentModel.count(query, cb);
        },
        items(cb) {
          CommentModel.find(query)
            .sort({ createdAt: -1 })
            .skip(page * take)
            .limit(take)
            .exec(function(err,comments){
              if(err){
                cb(err);
              }else {
                  async.map(comments, function(comment, callback){
                    comment = comment.toObject();
                    if(comment.user || comment.performer){
                      if(comment.user){
                        UserBusiness.findOneByAdmin({_id: comment.user}).then(function(user){
                        if(user){
                          comment.user = user;
                        }
                        callback(null, comment);
                      })
                    }else
                      if(comment.performer){
                        PerformerBusiness.findOne({_id: comment.performer}).then(function(performer){
                        if(performer){
                          comment.user = performer;
                        }
                        callback(null, comment);
                      })
                      }
                    }else {
                      callback("Comment user is not exist");
                    }
                },
              function(err, comments){
                  cb(err, comments);
                });
              }
            });
        }
      }, (err, result) => {
        if (err) { return res.status(500).send(err); }

        res.status(200).json(result);
      });
  }

  /**
   * Creates a new Comment
   */
  static create(req, res, next) {
    CommentValidator.validateCreating(req.body).then(data => {
      CommentBusiness.create(data,req.query.type,req.user).then(function(comment) {
        VideoBusiness.findOne({_id: req.body.video})
        .then(video => {
          if (!video) {
            validationError(res, 422)({errors:{email:{message:'Video not found.'}}});
          }
          video.stats.totalComment = video.stats.totalComment + 1;
           VideoBusiness.update(video);
        })
        .catch(err => next(err));
        return res.status(200).json(comment);
      })
      .catch(err => {
        validationError(res, 422)(err);
      });
    })
    .catch(err => {
      validationError(res, 422)(parseJoiError(err));
    });
  }

  /**
  * Function create comment by type
  * @params {req} req
  * @params {res} res
  *
  * @return {Json}
  **/
  static createWithType(req, res, next) {
    CommentValidator.validateCreating(req.body).then(data => {
      if(req.body.type === 'payout'){
        if(!req.body.type){
          validationError(res, 422)("Payout is required");
        }
        else{
          if(req.isPerformer){
            CommentBusiness.createCommentOfPerformer(data, req.user).then(function(comment) {
                return res.status(200).json(comment);
            })
            .catch(err => {
              validationError(res, 422)(err);
            });;
          }
          else{
            CommentBusiness.create(data, req.query.type, req.user).then(function(comment) {
                return res.status(200).json(comment);
            })
            .catch(err => {
              validationError(res, 422)(err);
            });;
          }
        }
      }
    })
    .catch(err => {
      validationError(res, 422)(parseJoiError(err));
    });
  }
  /**
   * Get a single Comment
   */
  static show(req, res, next) {
    CommentBusiness.findOne({_id: req.params.id})
    .then(comment => {
      if (!comment) {
        return res.status(404).end();
      }
      res.json(comment);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single Comment
   */
  static update(req, res, next) {
    CommentValidator.validateUpdating(req.body).then(data => {
      CommentBusiness.findOne({_id: req.params.id}).then(comment => {

        if(!comment) {
          return validationError(res, 404)({message: 'Not found'});
        }
        if(data._id) {
          delete data._id;
        }
        comment = _.merge(comment, data);
        CommentBusiness.update(comment).then(function(comment) {
            return res.status(200).json(comment);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });
      });

  }

  /**
   * Deletes a Comment
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    CommentBusiness.findOne(condition).then(
      comment => {
        if(!comment) {
          return res.status(404,'Not found').end();
        }
        CommentBusiness.removeById(comment._id)
        .then(function(err) {
          if (!err) {
            VideoModel.update({
              _id: comment.video
            }, {
              $inc: {
                'stats.totalComment': -1
              }
            })
            .exec();
          }

          res.status(200,true).end();
        });
      },
      err => handleError(res)
    );
  }


  /**
   * Authentication callback
   */
  static stats(req, res) {
    let startDate = req.query.startDate ? moment(req.query.startDate).tz('America/New_York').toDate() : moment().tz('America/New_York').add(-7, 'days').toDate();
    let endDate = req.query.endDate ? moment(req.query.endDate).tz('America/New_York').endOf('day').toDate() : moment().tz('America/New_York').toDate();

    let chunks = dateChunk(startDate, endDate, 'day');
    let data = [];
    async.waterfall([
      function(cb) {
        VideoModel.find({
          performer: {
            $in: [req.user._id]
          }
        }, function(err, videos) {
          if (err) {
            return cb(err);
          }

          return cb(null, _.map(videos, v => v._id));
        });
      },
      function(videoIds, cb) {
        var data = [];
        async.eachSeries(chunks, function(chunk, cb) {
          CommentModel.count({
            video: {
              $in: videoIds
            },
            createdAt: {
              $lt: chunk.end,
              $gt: chunk.start
            }
          }, function(err, count) {
            data.push({
              start: chunk.start,
              end: chunk.end,
              count: err ? 0 : count
            });

            cb();
          });
        }, function() {
          cb(null, data);
        });
      }
    ], function(err, data) {
      if (err) {
        return handleError(res);
      }

      res.status(200).send(data);
    });
  }
}

module.exports = CommentController;
