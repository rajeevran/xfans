import { VideoModel, PhotoModel } from '../models';
import { Queue, AWSS3 } from '../components';
import { StringHelper } from '../helpers';
import async from 'async';
import config from '../config/environment';
import path from 'path';

module.exports = function(cb) {
  async.waterfall([
    function(cb) {
      VideoModel.find({}).limit(10000).exec(function(err, videos) {
        if (err) {
          return cb(err);
        }
        
        async.eachSeries(videos, function(video, cb) {
          if (video.filePath && !StringHelper.isUrl(video.filePath)) {
            console.log('Upload video file ' + video.name);
            Queue.create('GET_SIZE_AND_UPLOAD_S3', video.toObject()).save();
          }
          if (video.fileTrailerPath && !StringHelper.isUrl(video.filePath)) {
            console.log('Upload video trailer ' + video.name);
            Queue.create('UPLOAD_TRAILER_TO_S3', video.toObject()).save();
          }
          
          //upload for thumb
          if (video.thumbs) {
            Queue.create('UPLOAD_THUMBS_S3', {
              videoId: video._id,
              thumbs: video.thumbs
            }).save();
          }
          cb();
        }, function() {
          cb();
        });
      });
    },
    function(cb) {
      PhotoModel.find({}).limit(10000).exec(function(err, photos) {
        if (err) {
          return cb(err);
        }
        
        async.eachSeries(photos, function(photo, cb) {
          async.auto({
            imageFullPath(cb) {
              if (StringHelper.isUrl(photo.imageFullPath)) {
                return cb(null, photo.imageFullPath);
              }
              var filePath = path.join(config.clientFolder, photo.imageFullPath);
              AWSS3.uploadFile({
                ACL: 'public-read',
                contentType: 'image/png',
                filePath: filePath,
                fileName: StringHelper.getFileName(photo.imageFullPath)
              }, function(err, data) {
                if (err || !data) {
                  return cb(null, '');
                }
                
                cb(null, data.url);
              });
            },
            imageThumbPath(cb) {
              if (StringHelper.isUrl(photo.imageThumbPath)) {
                return cb(null, photo.imageThumbPath);
              }
              var filePath = path.join(config.clientFolder, photo.imageThumbPath);
              AWSS3.uploadFile({
                ACL: 'public-read',
                contentType: 'image/png',
                filePath: filePath,
                fileName: StringHelper.getFileName(photo.imageThumbPath)
              }, function(err, data) {
                if (err || !data) {
                  return cb(null, '');
                }
                
                cb(null, data.url);
              });
            },
            imageMediumPath(cb) {
              if (StringHelper.isUrl(photo.imageMediumPath)) {
                return cb(null, photo.imageMediumPath);
              }
              var filePath = path.join(config.clientFolder, photo.imageMediumPath);
              AWSS3.uploadFile({
                ACL: 'public-read',
                contentType: 'image/png',
                filePath: filePath,
                fileName: StringHelper.getFileName(photo.imageMediumPath)
              }, function(err, data) {
                if (err || !data) {
                  return cb(null, '');
                }
                
                cb(null, data.url);
              });
            }
          }, function(err, result) {
            result.images = [result.imageFullPath];
            PhotoModel.update({
              _id: photo._id
            }, {
              $set: result
            }, function() {
              cb();
            });
          });
        }, function() {
          cb();
        })
      });
    }
  ], function(err) {
    return cb(err);
  });
};
