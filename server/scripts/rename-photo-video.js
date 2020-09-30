import { VideoModel, PhotoModel } from '../models';
import async from 'async';
import fs from 'fs';
import config from '../config/environment';
import StringHelper from '../helpers/StringHelper';
import _ from 'lodash';

let clientFolder = config.clientFolder;
if (clientFolder.charAt(clientFolder.length - 1) == "/") {
  clientFolder = clientFolder.substr(0, clientFolder.length - 1);
}

module.exports = function(cb) {
  async.waterfall([
    function(cb) {
      VideoModel.find({}, function(err, videos) {
        async.eachSeries(videos, function(video, cb) {
          let filePath = clientFolder + video.filePath;
          let fileTrailerPath = clientFolder + video.fileTrailerPath;
          let imageFullPath = clientFolder + video.imageFullPath;
          let imageThumbPath = clientFolder + video.imageThumbPath;
          let imageMediumPath = clientFolder + video.imageMediumPath;
          let updated = {};
          if (fs.existsSync(filePath)) {
            let ext = StringHelper.getExt(video.filePath);
            let newName = StringHelper.getFilePath(video.filePath) + '/' + StringHelper.generateUuid() + ext;
            fs.renameSync(filePath, clientFolder + newName);
            updated.filePath = newName;
          }
          if (fs.existsSync(fileTrailerPath)) {
            let ext = StringHelper.getExt(video.fileTrailerPath);
            let newName = StringHelper.getFilePath(video.fileTrailerPath) + '/' + StringHelper.generateUuid() + ext;
            fs.renameSync(fileTrailerPath, clientFolder + newName);
            updated.fileTrailerPath = newName;
          }
          if (fs.existsSync(imageFullPath)) {
            let ext = StringHelper.getExt(video.imageFullPath);
            let newName = StringHelper.getFilePath(video.imageFullPath) + '/' + StringHelper.generateUuid() + ext;
            fs.renameSync(imageFullPath, clientFolder + newName);
            updated.imageFullPath = newName;
          }
          if (fs.existsSync(imageThumbPath)) {
            let ext = StringHelper.getExt(video.imageThumbPath);
            let newName = StringHelper.getFilePath(video.imageThumbPath) + '/' + StringHelper.generateUuid() + ext;
            fs.renameSync(imageThumbPath, clientFolder + newName);
            updated.imageThumbPath = newName;
          }
          if (fs.existsSync(imageMediumPath)) {
            let ext = StringHelper.getExt(video.imageMediumPath);
            let newName = StringHelper.getFilePath(video.imageMediumPath) + '/' + StringHelper.generateUuid() + ext;
            fs.renameSync(imageMediumPath, clientFolder + newName);
            updated.imageMediumPath = newName;
          }

          if (_.isEmpty(updated)) {
            return cb();
          }
          
          VideoModel.update({
            _id: video._id
          }, {
            $set: updated
          }, () => cb());
        }, () => cb());
      });
    },
    function(cb) {
      PhotoModel.find({}, function(err, photos) {
        async.eachSeries(photos, function(photo, cb) {
          let imageFullPath = clientFolder + photo.imageFullPath;
          let imageThumbPath = clientFolder + photo.imageThumbPath;
          let imageMediumPath = clientFolder + photo.imageMediumPath;
          let updated = {};
          if (fs.existsSync(imageFullPath)) {
            let ext = StringHelper.getExt(photo.imageFullPath);
            let newName = StringHelper.getFilePath(photo.imageFullPath) + '/' + StringHelper.generateUuid() + ext;
            fs.renameSync(imageFullPath, clientFolder + newName);
            updated.imageFullPath = newName;
          }
          
          if (fs.existsSync(imageThumbPath)) {
            let ext = StringHelper.getExt(photo.imageThumbPath);
            let newName = StringHelper.getFilePath(photo.imageThumbPath) + '/' + StringHelper.generateUuid() + ext;
            fs.renameSync(imageThumbPath, clientFolder + newName);
            updated.imageThumbPath = newName;
          }
          
          if (fs.existsSync(imageMediumPath)) {
            let ext = StringHelper.getExt(photo.imageMediumPath);
            let newName = StringHelper.getFilePath(photo.imageMediumPath) + '/' + StringHelper.generateUuid() + ext;
            fs.renameSync(imageMediumPath, clientFolder + newName);
            updated.imageMediumPath = newName;
          }
          
          if (_.isEmpty(updated)) {
            return cb();
          }
          
          PhotoModel.update({
            _id: photo._id
          }, {
            $set: updated
          }, () => cb());
        }, () => cb());
      });
    }
  ], () => cb());
};
