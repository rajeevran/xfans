import { Queue, VideoConverter } from './components';
import { VideoModel } from './models';
import async from 'async';

module.exports = function () {
  setTimeout(function () {
    VideoModel.update({
      'convertStatus.mainVideo': 'processing'
    }, {
        $set: {
          'convertStatus.mainVideo': 'pending'
        }
      }, {
        multi: true
      }, function (err) {
        if (err) {
          return console.log(err);
        }

        VideoModel.find({
          'convertStatus.mainVideo': 'pending'
        }, function (err, videos) {
          if (err) {
            return console.log(err);
          }

          async.eachSeries(videos, function (video, cb) {
            var doc = video.toObject();
            async.waterfall([
              function (cb) {
                if (!doc.filePath) {
                  return cb();
                }

                Queue.create('CREATE_THUMBS', {
                  videoId: doc._id,
                  filePath: doc.filePath
                })
                  .save(() => cb());
              },
              function (cb) {
                if (doc.convertStatus && doc.convertStatus.trailer === 'pending' && doc.fileTrailerPath) {
                  Queue.create('CONVERT_TRAILER_VIDEO', {
                    videoId: doc._id,
                    filePath: doc.fileTrailerPath,
                    key: 'trailer',
                    deleteOldFile: false
                  })
                    .save(() => cb());
                } else {
                  cb();
                }
              },
              function (cb) {
                if (doc.convertStatus && doc.convertStatus.mainVideo === 'pending' && doc.filePath) {
                  Queue.create('CONVERT_MAIN_VIDEO', {
                    videoId: doc._id,
                    filePath: doc.filePath,
                    key: 'mainVideo',
                    createVideoThumb: !doc.imageFullPath ? true : false,
                    deleteOldFile: false
                  })
                    .save(() => cb());
                } else {
                  cb();
                }
              }
            ], function () {
              console.log('Do updated for ' + video._id + ' ' + video.name);
              cb();
            });
          });
        });
      });
  }, 1000);
};
