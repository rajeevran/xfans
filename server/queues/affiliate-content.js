import { VideoConverter, Queue, AWSS3, ElasticTranscoder } from '../components';
import { AffiliateContent, TmpFile, SettingModel } from '../models';
import { StringHelper } from '../helpers';
import config from '../config/environment';
import path from 'path';
import fs from 'fs';
import async from 'async';

function convertTime(second) {
  var hours = Math.floor(second / 3600) < 10 ? ("00" + Math.floor(second / 3600)).slice(-2) : Math.floor(second / 3600);
  var minutes = ("00" + Math.floor((second % 3600) / 60)).slice(-2);
  var seconds = ("00" + Math.floor((second % 3600) % 60)).slice(-2);
  return hours + ":" + minutes + ":" + seconds;
}

module.exports = function(queue) {
  queue.process('CONVERT_AFFILIATE_CONTENT', function(job, done) {
    const affiliateContent = job.data;
    let filePath = path.join(config.clientFolder, affiliateContent.filePath);
    let fileName = StringHelper.getFileName(affiliateContent.filePath);
    AWSS3.uploadFile({
      filePath: filePath,
      fileName: fileName
    }, function(err, data) {
      if (err) {
        return done();
      }

      SettingModel.findOne({}, function(err, setting) {
        let watermark = 'images/watermark.png';
        if (!err && setting && setting.videoWatermarkPath) {
          watermark = AWSS3.getKey(setting.videoWatermarkPath);
        }

        ElasticTranscoder.convertVideo({
          inputFile: fileName,
          outputFile: fileName,
          width: 720,
          addWatermark: true,
          watermarkFile: watermark
        }, function(err, etData) {
          if (err) {
            return done();
          }

          AffiliateContent.update({
            _id: affiliateContent._id
          }, {
            $set: {
              convertStatus: 'done',
              filePath: etData.url
            }
          }, {
            upsert: true
          }, function() {
            TmpFile.create({
              filePath: path.join(config.clientFolder, affiliateContent.filePath)
            });
            done();
          });
        });
      });
    });
  });

  queue.process('UDATE_WATERMARK_AFFILIATE_CONTENT', function(job, done) {
    const affiliateContent = job.data;
    let filePath = AWSS3.getKey(affiliateContent.filePath);
    let fileName = StringHelper.getFileName(affiliateContent.filePath);

    SettingModel.findOne({}, function(err, setting) {
      let watermark = 'images/watermark.png';
      if (!err && setting && setting.videoWatermarkPath) {
        watermark = AWSS3.getKey(setting.videoWatermarkPath);
      }

      ElasticTranscoder.convertVideo({
        inputFile: filePath,
        outputFile: 'wm_'+ fileName,
        width: 720,
        addWatermark: true,
        watermarkFile: watermark
      }, function(err, etData) {
        if (err) {
          return done();
        }

        AffiliateContent.update({
          _id: affiliateContent._id
        }, {
          $set: {
            convertStatus: 'done',
            filePath: etData.url,
            addedWatermark: true
          }
        }, {
          upsert: true
        }, function() {
          done();
        });
      });
    });
  });
};
