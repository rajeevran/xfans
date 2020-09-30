import { AWSS3, Queue, VideoConverter } from '../components';
import { StringHelper } from '../helpers';
import { VideoModel } from '../models';
import fs from 'fs';
import request from 'request';
import config from '../config/environment';
import path from 'path';
import download from 'download-file';

module.exports = function(queue) {
  queue.process('DOWNLOAD_AND_UPDATE_CLIP', function(job, done) {
    let attempts = 0;
    let data = job.data;

    let url = AWSS3.getSignedUrl(data.clipUrl);
    function tryToUpload() {
      let filename = data.video.name.replace(/[^a-zA-Z0-9]/g,'_') + '_' + StringHelper.randomString(5) + '.mp4';
      let storeFile = path.join(config.fileTempFolder, filename);
      download(url, {
        directory: config.fileTempFolder,
        filename: filename
      }, function (err) {
        if (err) {
          //should try just 3 times
          if (attempts > 2) {
            return done();
          }

          attempts++;
          return setTimeout(tryToUpload, 10000);
        }

        //now try to convert this video and do upload to s3 again
        VideoConverter.createClip({
          filePath: storeFile
        }, function(err, clipFile) {
          if (err) {
            console.log('Create clip file error', err);
            return done();
          }
          //delete old file
          fs.unlink(storeFile, function() {});
          //do upload this file to s3 and update video
          let clipName = 'clip_' + data.video.name.replace(/[^a-zA-Z0-9]/g,'_') + '_' + StringHelper.randomString(5) + '.mp4';
          AWSS3.uploadFile({
            filePath: clipFile,
            fileName: clipName,
            ACL: 'public-read'
          }, function(err, clipData) {
            if (err) {
              console.log('upload s3 failed');
              return done();
            }

            //remove converted file
            fs.unlink(path.join(config.fileTempFolder, clipFile), function() {});
            VideoModel.update({
              _id: data.video._id
            }, {
              $set: {
                clipUrl: clipData.url
              }
            }, function() {
              done();
            });
          });
        });
      });
    }

    tryToUpload();
  });
};
