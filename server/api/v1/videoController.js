"use strict";

import {
  VideoModel,
  UserModel,
  PerformerModel,
  OrderModel,
  LikeModel,
  TmpFile
} from "../../models";
import {
  VideoBusiness,
  UserBusiness
} from "../../businesses";
import {
  VideoValidator,
  parseJoiError
} from "../../validators";
import passport from "passport";
import config from "../../config/environment";
import {
  S3,
  GM,
  Uploader,
  Queue,
  AWSS3
} from "../../components";
import {
  StringHelper
} from "../../helpers";
import jwt from "jsonwebtoken";
import _ from "lodash";
import async from "async";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import moment from "moment-timezone";
//import ffmpeg from 'fluent-ffmpeg';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}
var videosFolderCache = null;
var videosFolderCacheTime = null;

function mapUserInfo(videos, cb) {
  if (!Array.isArray(videos)) {
    return cb(null, videos);
  }

  let userIds = videos.map(video => video.user);
  if (!userIds.length) {
    return cb(null, videos);
  }

  async.auto({
      users(cb) {
        UserModel.find({
            _id: {
              $in: userIds
            }
          },
          cb
        );
      },
      performers(cb) {
        PerformerModel.find({
            _id: {
              $in: userIds
            }
          },
          cb
        );
      }
    },
    function (err, result) {
      if (err) {
        return cb(null, videos);
      }

      let users = result.users.concat(result.performers);

      videos.forEach(video => {
        if (video.user) {
          let index = _.findIndex(
            users,
            u => u._id.toString() === video.user.toString()
          );
          if (index > -1) {
            video.userInfo = users[index].publicProfile();
          }
        }
      });

      cb(null, videos);
    }
  );
}

class VideoController {
  /**
   * Get list of Videos
   */
  static index(req, res) {
    if (req.query.limit != "undefined") {
      req.query.limit = parseInt(req.query.limit);
    }
    if (req.query.offset != "undefined") {
      req.query.offset = parseInt(req.query.offset);
    }

    //add params to check admin
    var params = _.assign(req.query, {
      isAdmin: req.user && req.user.role === "admin"
    });
    if (!params.isAdmin && !req.isPerformer) {
      params.status = "active";
    }

    if (req.performer) {
      params.id = req.performer._id;
      delete params.performer;
    }
    return VideoBusiness.find(params)
      .then(videos => {
        mapUserInfo(videos, function (err, data) {
          res.status(200).json(data);
        });
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Video
   */
  static create(req, res, next) {
    VideoValidator.validateCreating(req.body)
      .then(data => {
        return VideoBusiness.create(data, req.user).then(function (video) {
          video.imageType = config.imageType;
          video.fileType = config.fileType;
          async.auto({
              image(cb) {
                if (!req.files.file || !req.files.file.image) {
                  return cb();
                }

                let Func =
                  config.imageType === "s3" ?
                  Uploader.uploadImageWithThumbnailsToS3 :
                  Uploader.uploadImageWithThumbnails;
                Func(req.files.file.image, req.user._id, cb);
              },
              fileFullPath(cb) {
                if (!req.files.file || !req.files.file.fileFullPath) {
                  return cb();
                }

                Uploader.uploadFile(req.files.file.fileFullPath, cb);
              },
              fileTrailerPath(cb) {
                if (!req.files.file || !req.files.file.fileTrailerPath) {
                  return cb();
                }

                Uploader.uploadFile(req.files.file.fileTrailerPath, cb);
              }
            },
            function (err, result) {
              if (err) {
                return res.status(400).send(err);
              }

              if (result.image) {
                _.merge(video, result.image);
              }
              if (result.fileFullPath) {
                video.filePath = result.fileFullPath;
              }
              if (result.fileTrailerPath) {
                video.fileTrailerPath = result.fileTrailerPath;
              }
              return VideoBusiness.create(video, req.user)
                .then(() => {
                  if (config.fileType === "s3") {
                    if (video.filePath) {
                      Queue.create(
                        "GET_SIZE_AND_UPLOAD_S3",
                        video.toObject()
                      ).save();
                    }
                    if (video.fileTrailerPath) {
                      Queue.create(
                        "UPLOAD_TRAILER_TO_S3",
                        video.toObject()
                      ).save();
                    }
                  } else {
                    if (video.filePath) {
                      Queue.create(
                        "GET_SIZE_AND_STORE",
                        video.toObject()
                      ).save();
                    }
                    if (video.fileTrailerPath) {
                      Queue.create(
                        "UPLOAD_TRAILER_TO_STORE",
                        video.toObject()
                      ).save();
                    }
                  }
                  return res.status(200).json(video);
                })
                .catch(validationError(res));
            }
          );
        });
      })
      .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Get a single Video
   */
  static show(req, res, next) {
    VideoBusiness.findOne({
        _id: req.params.id
      })
      .then(video => {
        if (!video) {
          return res.status(404).end();
        }
        video = video.toObject();
        //give access for s3 file
        //TODO - check permission of user here
        if (config.fileType === "s3") {
          video.filePath = AWSS3.getSignedUrl(video.filePath);
          video.fileTrailerPath = AWSS3.getSignedUrl(video.fileTrailerPath);
          if (video.convertedFiles) {
            video.convertedFiles.forEach(
              v => (v.path = AWSS3.getSignedUrl(v.path))
            );
          }
        }
        //map user info
        if (!video.user) {
          return res.json(video);
        }

        async.parallel(
          [
            function (callback) {
              async.auto({
                  user(cb) {
                    UserModel.findOne({
                        _id: video.user
                      },
                      cb
                    );
                  },
                  performer(cb) {
                    PerformerModel.findOne({
                        _id: video.user
                      },
                      cb
                    );
                  }
                },
                function (err, result) {
                  if (!err) {
                    if (result.user) {
                      video.userInfo = result.user.publicProfile();
                    } else if (result.performer) {
                      video.userInfo = result.performer.publicProfile();
                    }
                  }
                  callback();
                }
              );
            },
            function (callback) {
              async.each(
                video.performer,
                function (item, callback) {
                  PerformerModel.findOne({
                    _id: item
                  }).then(function (performerInfo) {
                    if (performerInfo) {
                      video.performerInfo = [];
                      video.performerInfo.push(performerInfo);
                    }
                    callback();
                  });
                },
                function (err) {
                  callback();
                }
              );
            }
          ],
          function (err) {
            if (err) {
              return res.status(404).end();
            } else {
              return res.json(video);
            }
          }
        );
      })
      .catch(err => next(err));
  }

  /**
   * Get a single Video
   */
  static showWithUploader(req, res, next) {
    VideoBusiness.findOne({
        _id: req.params.id
      })
      .then(video => {
        if (video) {
          if (video.user) {
            UserBusiness.findOneByAdmin({
              _id: video.user
            }).then(function (user) {
              if (user) {
                video.user = user;
              }
              res.json(video);
            });
          } else {
            res.json(video);
          }
        } else {
          return res.status(404).end();
        }
      })
      .catch(err => next(err));
  }

  /**
   * Get a single Video
   */
  static update(req, res, next) {
    VideoValidator.validateUpdating(req.body)
      .then(data => {
        return VideoBusiness.findOne({
          _id: req.body._id
        }).then(video => {
          //var performerId = mongoose.Types.ObjectId(req.body.performer);
          video.name = req.body.name;
          video.description = req.body.description;
          video.metaKeywords = req.body.metaKeywords;
          video.metaDescription = req.body.metaDescription;
          video.metaTitle = req.body.metaTitle;
          video.performer = req.body.performer;
          video.isSchedule = req.body.isSchedule;
          video.schedule = req.body.schedule;
          video.categories = req.body.categories;
          video.photos = req.body.photos;
          video.tags = req.body.tags;
          video.sort = req.body.sort;
          video.type = req.body.type;
          video.status = req.body.status;
          video.isSaleVideo = req.body.isSaleVideo;
          video.price = req.body.price;
          video.imageType = config.imageType;
          video.fileType = config.fileType;
          video.photoAlbumId = req.body.photoAlbumId;
          video.customTwitterTextVideo = req.body.customTwitterTextVideo;
          video.allowViewSaleIds = req.body.allowViewSaleIds;
          let uploadFile = false;
          let uploadTrailer = false;
          async.auto({
              image(cb) {
                if (!req.files || !req.files.file || !req.files.file.image) {
                  return cb();
                }

                let Func =
                  config.imageType === "s3" ?
                  Uploader.uploadImageWithThumbnailsToS3 :
                  Uploader.uploadImageWithThumbnails;
                Func(req.files.file.image, req.user._id, cb);
              },
              fileFullPath(cb) {
                if (
                  !req.files ||
                  !req.files.file ||
                  !req.files.file.fileFullPath
                ) {
                  return cb();
                }

                Uploader.uploadFile(req.files.file.fileFullPath, cb);
              },
              fileTrailerPath(cb) {
                if (
                  !req.files ||
                  !req.files.file ||
                  !req.files.file.fileTrailerPath
                ) {
                  return cb();
                }

                Uploader.uploadFile(req.files.file.fileTrailerPath, cb);
              }
            },
            function (err, result) {
              if (err) {
                return res.status(400).send(err);
              }

              if (result.image) {
                _.merge(video, result.image);
              }
              if (result.fileFullPath) {
                video.filePath = result.fileFullPath;
                uploadFile = true;
              }
              if (result.fileTrailerPath) {
                video.fileTrailerPath = result.fileTrailerPath;
                uploadTrailer = true;
              }

              return VideoBusiness.update(video)
                .then(() => {
                  if (config.fileType === "s3") {
                    if (uploadFile) {
                      Queue.create(
                        "GET_SIZE_AND_UPLOAD_S3",
                        video.toObject()
                      ).save();
                    }
                    if (uploadTrailer) {
                      Queue.create(
                        "UPLOAD_TRAILER_TO_S3",
                        video.toObject()
                      ).save();
                    }
                  } else {
                    if (uploadFile) {
                      Queue.create(
                        "GET_SIZE_AND_STORE",
                        video.toObject()
                      ).save();
                    }
                    if (uploadTrailer) {
                      Queue.create(
                        "UPLOAD_TRAILER_TO_STORE",
                        video.toObject()
                      ).save();
                    }
                  }
                  return res.status(200).json(video);
                })
                .catch(err => res.status(200).send(err));
            }
          );
        });
        //validationError(res, 422)(parseJoiError(err))
      })
      .catch(err => res.status(200).send(err));
  }

  /**
   * Like Video
   */
  static like(req, res, next) {
    VideoBusiness.findOne({
        _id: req.body.id
      })
      .then(video => {
        if (!video) {
          return validationError(
            res,
            404
          )({
            message: "Not found"
          });
        }
        LikeModel.findOne({
          user: req.user._id,
          video: req.body.id
        }, function (error, count) {
          if (error) {
            return res.status(500).send(error)
          }
          if (count) {
            return res.status(400).json("You've like this video earlier.");
          }

          video.stats.totalLike = video.stats.totalLike + 1;

          let like = new LikeModel({
            user: req.user._id,
            video: req.body.id
          });
          like.save(function () {
            VideoBusiness.update(video)
              .then(function (video) {
                return res.status(200).json(video);
              })
              .catch(err => {
                validationError(res, 500)(err);
              });
          });
        })
      })
      .catch(err => {
        validationError(res, 422)(parseJoiError(err));
      });
  }

  /**
   * Deletes a Video
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    };
    if (req.user.role !== "admin") {
      condition.user = req.user._id;
    }
    VideoBusiness.findOne(condition).then(
      video => {
        if (!video) {
          return res.status(404, "Not found").end();
        }
        video.remove();
        res.status(200, true).end();
      },
      err => handleError(res)
    );
  }

  static folder(req, res, next) {
    if (
      videosFolderCache &&
      videosFolderCacheTime &&
      moment(videosFolderCacheTime)
      .add(4, "hours")
      .isAfter(new Date())
    ) {
      return res.status(200).json(videosFolderCache);
    } else {
      videosFolderCache = null;
      videosFolderCacheTime = null;
    }

    var walk = function (dir, done) {
      var rootDir = config.clientFolder;
      var results = [];
      fs.readdir(rootDir + dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
          var file = list[i++];
          if (!file) return done(null, results);
          file = dir + "/" + file;
          fs.stat(rootDir + file, function (err, stat) {
            if (stat && stat.isDirectory()) {
              walk(file, function (err, res) {
                results = results.concat(res);
                next();
              });
            } else {
              var i = file.lastIndexOf(".");
              let ext = i < 0 ? "" : file.substr(i);
              if (ext === ".mp4") {
                results.push(file);
              }
              next();
            }
          });
        })();
      });
    };

    walk("/uploads", function (err, results) {
      if (err) {
        return res.status(404, "Not found").end();
      }
      videosFolderCache = results;
      videosFolderCacheTime = new Date();
      res.status(200).json(results);
    });
  }

  static search(req, res) {
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 12;
    let start = req.query.start ?
      moment(req.query.start)
      .tz("America/New_York")
      .toDate() :
      moment()
      .tz("America/New_York")
      .startOf("month")
      .toDate();
    let end = req.query.end ?
      moment(req.query.end)
      .tz("America/New_York")
      .toDate() :
      moment()
      .tz("America/New_York")
      .endOf("month")
      .toDate();
    let query = {};
    let sort = {
      activeDate: -1
    };
    if (req.query.keyword) {
      let regex = new RegExp(req.query.keyword, "i");
      query.$and = [{
        $or: [{
            name: regex
          },
          {
            description: regex
          },
          {
            tag: {
              $in: [req.query.keyword]
            }
          }
        ]
      }];
    }

    if (req.query.categoryId) {
      query.categories = {
        $in: [req.query.categoryId]
      };
    }

    if (req.query.performerId) {
      query.performer = {
        $in: [req.query.performerId]
      };
    }
    if (req.query.user) {
      query.user = req.query.user;
    }

    if (req.query.isSaleVideo) {
      query.isSaleVideo = req.query.isSaleVideo;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.isSchedule && req.query.start && req.query.end) {
      query.isSchedule = req.query.isSchedule;
      query.schedule = {
        $gte: start,
        $lte: end
      };
    }

    if (req.query.sort === "mostLike") {
      sort = {
        "stats.totalLike": -1
      };
    } else if (req.query.sort === "mostView") {
      sort = {
        "stats.totalView": -1
      };
    } else if (req.query.sort === "newest") {
      sort = {
        updatedAt: -1
      };
    } else if (req.query.sort === "oldest") {
      sort = {
        updatedAt: 1
      };
    }

    let s3LinkOptions = {};
    if (req.query.filter && req.query.filter === "tag" && req.user) {
      query.user = {
        $ne: req.user._id
      };
      s3LinkOptions.forceDownload = true;
    }

    async.parallel({
        items(cb) {
          VideoModel.find(query)
            .sort(sort)
            .skip(page * take)
            .limit(take)
            .exec(cb);
        },
        count(cb) {
          VideoModel.count(query, cb);
        }
      },
      function (err, result) {
        if (err) {
          return res.status(500).send(err);
        }

        result.items.forEach(video => {
          if (video.fileType === "s3") {
            video.filePath = AWSS3.getSignedUrl(video.filePath);
            if (video.convertedFiles) {
              video.convertedFiles.forEach(
                v => (v.path = AWSS3.getSignedUrl(v.path))
              );
            }
          }
        });
        mapUserInfo(result.items, function (err, data) {
          res.status(200).send(result);
        });
      }
    );
  }

  static topVideos(req, res) {
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 12;

    let query = {
      status: "active",
      $and: []
    };

    if (req.query.keyword) {
      let regex = new RegExp(req.query.keyword, "i");
      query.$and.push({
        $or: [{
            name: regex
          }
          // {
          //   description: regex
          // }
        ]
      });
    }

    if (req.query.performerId) {
      query.performer = {
        $in: [req.query.performerId]
      };
    }

    if (!query.$and.length) {
      delete query.$and;
    }

    async.parallel({
        items(cb) {
          let sort = {
            totalView: -1,
            totalLike: -1,
            totalComment: -1
          };
          if (req.query.sort) {
            sort[req.query.sort] = -1;
          }
          VideoModel.find(query)
            .sort(sort)
            .skip(page * take)
            .limit(take)
            .exec(cb);
        },
        count(cb) {
          VideoModel.count(query, cb);
        }
      },
      function (err, result) {
        if (err) {
          return res.status(500).send(err);
        }

        mapUserInfo(result.items, function (err, data) {
          res.status(200).send(result);
        });
      }
    );
  }

  static checkBuySaleVideo(req, res) {
    VideoBusiness.findOne({
        _id: req.params.id
      })
      .then(video => {
        if (video) {
          if (req.user._id.toString() === video.user.toString()) {
            return res.status(200).send({
              ok: 1
            });
          } else {
            OrderModel.count({
                user: req.user._id,
                videoId: req.params.id
              },
              function (err, count) {
                return res.status(200).send({
                  ok: !err && count
                });
              }
            );
          }
        } else {
          return res.status(404).end();
        }
      })
      .catch(err => next(err));
  }

  static adminCheckBuySaleVideo(req, res) {
    OrderModel.count({
        user: req.query.userId,
        videoId: req.params.id
      },
      function (err, count) {
        return res.status(200).send({
          ok: !err && count
        });
      }
    );
  }

  static getRelatedVideos(req, res) {
    //1.http://prntscr.com/im2uod the related videos of any particular video
    //should be sorted based on this priority -> name of video (matching names) -> tags -> categories. please update.
    let excludedIds = [req.params.id];
    async.auto({
        video(cb) {
          VideoModel.findOne({
              _id: req.params.id
            },
            cb
          );
        },
        byName: [
          "video",
          function (result, cb) {
            let query = {
              _id: {
                $nin: excludedIds
              },
              $text: {
                $search: result.video.name
              },
              status: "active"
            };
            if (req.query.performerId) {
              query.performer = {
                $in: [req.query.performerId]
              };
            }
            VideoModel.find(query, {
                score: {
                  $meta: "textScore"
                }
              })
              .sort({
                score: {
                  $meta: "textScore"
                }
              })
              .limit(100)
              .exec(cb);
          }
        ],
        byTags: [
          "byName",
          function (result, cb) {
            if (!result.video.tags || !result.video.tags.length) {
              return cb(null, []);
            }
            if (result.byName.length) {
              result.byName.forEach(item => excludedIds.push(item._id));
            }
            let query = {
              _id: {
                $nin: excludedIds
              },
              tags: {
                $in: result.video.tags
              },
              status: "active"
            };
            if (req.query.performerId) {
              query.performer = {
                $in: [req.query.performerId]
              };
            }
            VideoModel.find(query)
              .limit(100)
              .exec(cb);
          }
        ],
        byCategories: [
          "byTags",
          function (result, cb) {
            if (!result.video.categories || !result.video.categories.length) {
              return cb(null, []);
            }

            if (result.byTags.length) {
              result.byTags.forEach(item => excludedIds.push(item._id));
            }

            let query = {
              _id: {
                $nin: excludedIds
              },
              categories: {
                $in: result.video.categories
              },
              status: "active"
            };
            if (req.query.performerId) {
              query.performer = {
                $in: [req.query.performerId]
              };
            }
            VideoModel.find(query)
              .limit(100)
              .exec(cb);
          }
        ],
        byPerformer: [
          "byCategories",
          function (result, cb) {
            if (result.byCategories.length) {
              return cb(null, []);
            }

            if (result.byCategories.length) {
              result.byCategories.forEach(item => excludedIds.push(item._id));
            }

            let query = {
              _id: {
                $nin: excludedIds
              },
              performer: {
                $in: [result.video.user]
              },
              status: "active"
            };
            VideoModel.find(query)
              .limit(100)
              .exec(cb);
          }
        ]
      },
      function (err, result) {
        if (err) {
          return res.status(400).send(err);
        }

        let videos = result.byName
          .concat(result.byTags)
          .concat(result.byCategories)
          .concat(result.byPerformer);
        res.status(200).send(videos);
      }
    );
  }

  static increaseTotalView(req, res) {
    VideoModel.update({
        _id: req.params.id
      }, {
        $inc: {
          "stats.totalView": 1
        }
      },
      function () {
        res.status(200).end();
      }
    );
  }

  static tagsHint(req, res) {
    let query = {
      tags: {
        $exists: true,
        $not: {
          $size: 0
        }
      }
    };
    if (req.query.performerId) {
      query.performer = {
        $in: [req.query.performerId]
      };
    }
    VideoModel.find(query, "tags", function (err, data) {
      if (err) {
        return res.status(400).send(err);
      }

      let tags = [];
      data.forEach(i => (tags = i.tags.concat(tags)));

      tags = _.uniq(tags);
      res.status(200).send(tags);
    });
  }

  static tweet(req, res) {
    VideoModel.findOne({
        user: req.user._id,
        _id: req.params.id
      },
      function (err, video) {
        if (err || !video) {
          return res.status(404).send({
            message: "Item not found!"
          });
        }

        if (!req.user.connectTwitter) {
          return res.status(400).send({
            message: "Please connect your Twitter account"
          });
        }

        Queue.create("AUTO_POST_TWITTER", {
          videoId: video._id,
          type: "manual",
          performerId: video.user
        }).save();

        return res.status(200).send({
          message: "Added to queue!"
        });
      }
    );
  }
}

module.exports = VideoController;
