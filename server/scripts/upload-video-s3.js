import { VideoModel } from '../models';
import { Queue, AWSS3, Uploader } from '../components';
import { StringHelper } from '../helpers';
import async from 'async';
import config from '../config/environment';
import path from 'path';
import fs from 'fs';

module.exports = function(cb) {
  VideoModel.find({
    filePath: { 
      $regex : new RegExp('uploads/files', "i")
    }
  })
  .sort({ createdAt: -1 })
  .limit(100).exec(function(err, videos) {
    if (err) {
      return cb(err);
    }

    async.eachSeries(videos, function(video, cb) {
      var filePath = path.join(config.clientFolder, video.filePath);
      console.log('file ' + filePath);
      if (!fs.existsSync(filePath)) {
        console.log('not have file', filePath)
        return video.remove(function() {
          cb();
        });
      }
      
      var stats = fs.statSync(filePath);
      if (stats.size < 1000) {
        console.log('Broken file ' + video.filePath + ' ' + stats.size);
        return video.remove(function() {
          fs.unlink(filePath, function() {
            cb();
          });
        });
      }
      
      Queue.create('GET_SIZE_AND_UPLOAD_S3', video.toObject()).save(function() {
        cb();
      });
    }, cb);
  });
}
