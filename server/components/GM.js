'use strict';
//https://github.com/aheckmann/gm

import fs from 'fs';
import gm from 'gm';
import cb2Promise from 'promisify-node';
import os from 'os';
import path from 'path';
import { StringHelper } from '../helpers';
import config from '../config/environment';
const TMP_DIR = config.tmpFolder || os.tmpdir();

/**
 * export exif meta data from file
 * @param  {String}   filePath absolute path
 * @param  {Function} cb       callback function
 */
exports.identify = (filePath, cb) => {
  if (cb) {
    return gm(filePath).identify(cb);
  }
  //create promise
  return cb2Promise(gm(filePath).identify)();
};

/**
 * extract exif data as spec
 * @param  {String}   filePath path to image file
 * @param  {Function} cb
 * @return {void}
 */
exports.getExif = (filePath, cb) => {
  gm(filePath).identify((err, data) => {
    if (err) { return cb(err); }

    let defaultObj = {
      cameraBrand: '',
      cameraModel: '',
      lensBrand: '',
      lensModel: '',
      aperture: '', //Max Aperture Value
      angle: '',
      shutterSpeed: '',
      iso: '',
      takenDate: '',
      takenTime: '',
      flash: ''
    };

    if (!data['Profile-EXIF']) { return cb(null, defaultObj); }
    let exif = data['Profile-EXIF'];
    let dateArr = exif['Date Time'] ? exif['Date Time'].split(' ') : [];
    return cb(null, {
      cameraBrand: exif.Make || '',
      cameraModel: exif.Model ||'',
      lensBrand: '', //dont see option for now
      lensModel: '', //dont see option for now
      aperture: exif['Max Aperture Value'], //Max Aperture Value
      angle: '',
      shutterSpeed: '',
      iso: exif['ISO Speed Ratings'],
      takenDate: dateArr.length ? dateArr[0] : '',
      takenTime: dateArr.length === 2 ? dateArr[1] : '',
      flash: exif.Flash
    })
  });
};

/**
 * resize image
 * @param  {String}   filePath absolute file
 * @param  {Object}   options
 * {
 *   width: null or number
 *   height: null or number
 *   force: boolean default is fail means keeping expected ratio
 *   dest: destination of new file, default will write to tmp folder
 * }
 * @param  {Function} cb callback function
 * @return {void}
 */
exports.resize = (filePath, options, cb) => {
  options = options || {};
  let name = StringHelper.getFileName(filePath, true) + '-' +
            StringHelper.randomString(5) +
            StringHelper.getExt(filePath);

  let outName = options.dest || path.resolve(TMP_DIR + '/' + name);
  gm(filePath)
      .resize(options.width, options.height, '^')
      .gravity('Center')
    .crop(options.width, options.height)
    .write(outName, (err) => {
      if (err) { return cb(err); }

      cb(null, {
        path: outName
      });
    });
};

/**
 * thumb image
 * @param  {String}   filePath absolute file
 * @param  {Object}   options
 * {
 *   width: the minimum width of the thumbnail
 *   height: the minimum height of the thumbnail
 *   quality: Adjusts the image compression level. Ranges from 0 to 100 (best).
 *   dest: the path where the image will be saved, otherwise it will be stored in the temp folder
 * }
 * @param  {Function} cb callback function
 * @return {void}
 */
exports.thumb = (filePath, options, cb) => {
  let quality = options.quality || 70;
  let name = StringHelper.getFileName(filePath, true) + '-' +
            StringHelper.randomString(5) + '-' +
            options.width + '-' + options.height +
            StringHelper.getExt(filePath);

  let outName = options.dest || path.resolve(TMP_DIR + '/' + name);

  gm(filePath).thumb(options.width, options.height, outName, quality, (err) => {
    if (err) { return cb(err); }

    cb(null, {
      path: outName,
      quality: quality,
      name: name
    });
  });
};

/**
 * add watermark to image & output to file
 *
 * @param  {String}   filePath path to the file
 * @param  {Object}   options
 * @param  {Function} cb
 * @return {void}
 */
exports.addWatermark = (filePath, options, cb) => {
  options = options || {};
  let name = StringHelper.getFileName(filePath, true) + '-' +
            StringHelper.randomString(5) +
            StringHelper.getExt(filePath);

  let outName = options.dest || path.resolve(TMP_DIR + '/' + name);
  gm(filePath).size(function(err, value){
    var command = 'image Over 10,10 0,0 ' + config.watermarkFile;
    if (!err && value) {
      //TODO - get correct watermark width / height
      let x0 = value.width - 150;
      let y0 = value.height - 150;
      command = `image Over ${x0},${y0} 0,0 ` + config.watermarkFile;
    }

    //TODO - get watermark option (ex position)
    gm(filePath)
    .draw([command])
    .write(outName, (err) => {
      if (err) { return cb(err); }

      cb(null, {
        path: outName
      });
    });
  });
};

/**
 * add watermark to image & output to file
 *
 * @param  {String}   filePath path to the file
 * @param  {Object}   options
 * {
 *   width: number
 *   height: number
 *   dest: path
 * }
 * @param  {Function} cb
 * @return {void}
 */
exports.resizeAndAddWatermark = (filePath, options, cb) => {
  options = options || {};
  let name = StringHelper.getFileName(filePath, true) + '-' +
            StringHelper.randomString(5) +
            StringHelper.getExt(filePath);

  let outName = options.dest || path.resolve(TMP_DIR + '/' + name);
  gm(filePath).size(function(err, value){
    var command = 'image Over 10,10 0,0 ' + config.watermarkFile;
    if (!err && value) {
      //TODO - get correct watermark width / height
      //get ratio
      var width;
      var height;
      if (value.width > value.height) {
        height = Math.floor((value.height/value.width) * options.width);
        width  = options.width;
      } else {
        width  = Math.floor((value.width/value.height) * options.height);
        height = options.height;
      }

      let x0 = width - 50;
      let y0 = height - 50;
      command = `image Over ${x0},${y0} 0,0 ` + config.watermarkFile;
    }

    //TODO - get watermark option (ex position)
    gm(filePath)
    .resize(options.width, options.height)
    .draw([command])
    .write(outName, (err) => {
      if (err) { return cb(err); }

      cb(null, {
        path: outName
      });
    });
  });
};

exports.gm = gm;
