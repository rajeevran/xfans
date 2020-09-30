import { AWSS3, ElasticTranscoder, Queue } from '../components';
import { VideoModel } from '../models';
import { StringHelper } from '../helpers';
import async from 'async';
import fs from 'fs';

function convertTime(second) {
  var hours = Math.floor(second / 3600) < 10 ? ("00" + Math.floor(second / 3600)).slice(-2) : Math.floor(second / 3600);
  var minutes = ("00" + Math.floor((second % 3600) / 60)).slice(-2);
  var seconds = ("00" + Math.floor((second % 3600) % 60)).slice(-2);
  return hours + ":" + minutes + ":" + seconds;
}

module.exports = function(cb) {
  VideoModel.find({
    $or: [{
      clipUrl: {
        $exists: false
      }
    }, {
      clipUrl: null
    }, {
      filePath: {
        $ne: null
      }
    }]
  }, function(err, videos) {
    if (err) {
      return cb(err);
    }

    async.eachSeries(videos, function(video, cb) {
      //we will generate clip url by using aws transcoder, then download and convert
      let inputFile = AWSS3.getKey(video.filePath);
      ElasticTranscoder.createClip({
        inputFile,
        outputFile: video.name.replace(/[^a-zA-Z0-9]/g,'_') + '_' + StringHelper.randomString(5) + '.mp4',
        fromTime: !video.duration ? '0' : convertTime(video.duration / 2)
      }, function(err, clipUrl) {
        if (err) {
          console.log('Error for video ' + video._id);
          return cb();
        }

        Queue.create('DOWNLOAD_AND_UPDATE_CLIP', {
          videoId: video._id,
          clipUrl: clipUrl.url,
          video: video.toObject()
        })
        .save(() => cb());
      });
    }, cb);
  });
};
