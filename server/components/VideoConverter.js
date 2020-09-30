import ffmpeg from 'fluent-ffmpeg';
import { StringHelper } from '../helpers';
import path from 'path';
import config from '../config/environment';
import async from 'async';

module.exports = {
  getSizes(filePath, cb) {
    ffmpeg(filePath)
    .ffprobe(function(err, data) {
      if (err) {
        return cb(err);
      }

      let streamInfo;
      data.streams.forEach(function(stream) {
        if (stream.width && !streamInfo) {
          streamInfo = stream;
        }
      });
      if (!streamInfo) {
        return [{
          width: 720,
          height: 480
        }, {
          width: 480,
          height: 320
        }];
      }
      let sizes = [];
      if (streamInfo.width >= 1920) {
        sizes.push({
          width: 1920,
          height: 1080
        });
      }
      if (streamInfo.width >= 720) {
        sizes.push({
          width: 720,
          height: 480
        });
      }
      if (streamInfo.width >= 480) {
        sizes.push({
          width: 480,
          height: 320
        });
      }
      if (streamInfo.width >= 320) {
        sizes.push({
          width: 320,
          height: 240
        });
      }
      if (!sizes.length) {
        sizes = [{
          width: streamInfo.width,
          height: streamInfo.height
        }];
      }

      cb(null, sizes);
    });
  },

  videoToMp4(options, cb) {
    let filePath = options.filePath;
    let fileName = StringHelper.randomString(5) + '_' + StringHelper.getFileName(filePath, true) + '.mp4';
    let savePath = path.join(StringHelper.getFilePath(filePath), fileName);

    let command = new ffmpeg(filePath)
    // set target codec
    .videoCodec('libx264')
    //.addOption('-vf', 'scale=2*trunc(iw/2):-2')
    .outputOptions('-strict -2')
    .on('end', function() {
      cb(null, fileName);
    })
    .on('error', cb)
    .toFormat('mp4');
    if (options.size) {
      command.size(options.size);
    }
    // save to file
    command.save(savePath);
  },

  getThumb(options, cb) {
    let filePath = options.filePath;
    let thumbName = '';
    new ffmpeg(filePath)
    .on('filenames', function(filenames) {
      thumbName = filenames[0];
    })
    .on('end', function() {
      cb(null, '/uploads/images/' + thumbName);
    })
    .on('error', cb)
    // take 2 screenshots at predefined timemarks and size
    .screenshot({
      folder: config.imageTempFolder,
      filename: StringHelper.randomString(5) + '.png',
      size: '640x480',
      timemarks: [ '25%' ]
    });
  },

  getDuration(filePath, cb) {
    ffmpeg.ffprobe(filePath, function(err, metadata) {
      if (err) {
        return cb(err);
      }

      cb(null, parseInt(metadata.format.duration));
    });
  },

  getMultipleScreenshots(options, cb) {
    let filePath = options.filePath;
    let thumbs = [];
    new ffmpeg(filePath)
    .on('filenames', function(filenames) {
      thumbs = filenames.map(name => '/uploads/images/' + name);
    })
    .on('end', function() {
      cb(null, thumbs);
    })
    .on('error', cb)
    // take 2 screenshots at predefined timemarks and size
    .screenshot({
      folder: config.imageTempFolder,
      filename: StringHelper.randomString(5) + '-%s.png',
      count: options.count || 5,
      size: '320x240'
    });
  },

  /**
  * create 20s clip from the video
  */
  createClip(options, cb) {
    let filePath = options.filePath;
    let fileName = StringHelper.randomString(5) + '_clip_' + StringHelper.getFileName(filePath, true) + '.mp4';
    let savePath = path.join(StringHelper.getFilePath(filePath), fileName);

    let command = new ffmpeg(filePath)
    // set target codec
    // https://gist.github.com/nikhan/26ddd9c4e99bbf209dd7
    //ffmpeg -i in.mkv -pix_fmt yuv420p -vcodec libx264 -vf scale=640:-1 -acodec aac -vb 1024k -minrate 1024k -maxrate 1024k -bufsize 1024k -ar 44100  -ac 2  -strict experimental -r 30  out.mp4
    //ffmpeg -i test.mov -vcodec libx264 -vf 'scale=640:trunc(ow/a/2)*2' -acodec aac -vb 1024k -minrate 1024k -maxrate 1024k -bufsize 1024k -ar 44100 -strict experimental -r 30 out.mp4s
    .videoCodec('libx264')
    .addOption('-ss', options.fromTime || '0')
    .addOption('-t', '20')
    .addOption('-pix_fmt', 'yuv420p')
    .addOption('-vf', 'scale=640:-1')
    .addOption('-acodec', 'aac')
    .addOption('-vb', '1024k')
    .addOption('-minrate', '1024k')
    .addOption('-maxrate', '1024k')
    .addOption('-bufsize', '1024k')
    .addOption('-ar', '44100')
    .addOption('-ac', '2')
    .addOption('-r', '24')
    .size('360x?')
    .outputOptions('-strict experimental')
    .on('end', function() {
      cb(null, fileName);
    })
    .on('error', cb)
    .toFormat('mp4');
    if (options.size) {
      command.size(options.size);
    }
    // save to file
    command.save(savePath);
  }
};
