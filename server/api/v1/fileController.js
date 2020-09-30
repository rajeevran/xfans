'use strict';

import { Uploader, ElasticTranscoder, AWSS3, VideoConverter } from '../../components';
import config from '../../config/environment';
import fs from 'fs';
import path from 'path';
import { StringHelper } from '../../helpers';

exports.uploadFile = function (req, res) {
  if (!req.files || !req.files.file) {
    return res.status(400).send({
      file: 'Missing file'
    });
  }

  let Func = config.imageType === 's3' ? Uploader.uploadFileS3 : Uploader.uploadFile;
  Func(req.files.file, function (err, filePath) {
    if (err) {
      return res.status(400).send(err);
    }

    res.status(200).send({
      filePath
    });
  });
};

exports.uploadVideoFile = function (req, res) {
  if (!req.files || !req.files.file) {
    return res.status(400).send({
      file: 'Missing file'
    });
  }

  let Func = config.imageType === 's3' ? Uploader.uploadFileS3 : Uploader.uploadFile;
  Func(req.files.file, function (err, filePath) {
    if (err) {
      return res.status(400).send(err);
    }

    res.status(200).send({
      link: filePath
    });
  });
};

exports.uploadAndConvertVideo = function (req, res) {
  if (!req.files || !req.files.file) {
    return res.status(400).send({
      file: 'Missing file'
    });
  }

  var date = new Date();
  var fileName = date.getFullYear().toString() + (date.getMonth() + 1).toString() +
    date.getDate().toString() + date.getHours().toString() +
    date.getMinutes().toString() + date.getSeconds().toString() +
    "_" + req.files.file.name;

  AWSS3.uploadFile({
    filePath: req.files.file.path,
    fileName: fileName
  }, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }

    ElasticTranscoder.convertVideo({
      inputFile: fileName,
      outputFile: fileName,
      width: 480
    }, function (err, etData) {
      if (err) {
        return done();
      }

      fs.unlink(req.files.file.path, function () {
        res.status(200).send({
          link: etData.url
        });
      });
    });
  });
}

exports.uploadAndConvertVideoToStore = function (req, res) {
  if (!req.files || !req.files.file) {
    return res.status(400).send({
      file: 'Missing file'
    });
  }

  Uploader.uploadFile(req.files.file, (err, filePath) => {
    if (err) {
      return res.status(400).send(err);
    }
    let orgPath = filePath;
    filePath = path.join(config.clientFolder, filePath);
    VideoConverter.videoToMp4({
      filePath,
      size: '480x?'
    }, function (err, newPath) {
      if (err) {
        return res.status(400).send(err);
      }

      newPath = (orgPath.charAt(0) === '/' ? '' : '/') + StringHelper.getFilePath(orgPath) + '/' + newPath;
      fs.unlink(req.files.file.path, function () {
        res.status(200).send({
          link: newPath
        });
      });
    });
  });
}
