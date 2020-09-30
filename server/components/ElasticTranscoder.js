import config from '../config/environment';
import { StringHelper } from '../helpers';
const AWS = require('aws-sdk');
var elastictranscoder = new AWS.ElasticTranscoder({
  apiVersion: '2012-09-25',
  region: config.AWS.region,// config.region,
  accessKeyId: config.AWS.accessKeyId, // config.accessKeyId,
  secretAccessKey: config.AWS.secretAccessKey
});

exports.convertVideo = function(options, cb) {
  var inputFile = options.inputFile;
  var outputFile = StringHelper.getFileName(options.outputFile.replace(/^\/|\/$/g, ''), true) + '.mp4';
  //change to mp4 ext
  var PresetId = '1351620000001-000001';
  if (options.width >= 1080) {
    PresetId = '1351620000001-000001'
  } else if (options.width >= 720) {
    // our custom preset in the aws
    PresetId = options.addWatermark ? '1532021377930-7dyp2q' : '1351620000001-000010';
  } else if (options.width >= 480) {
    PresetId = '1351620000001-000020';
  } else {
    PresetId = '1351620000001-000061';
  }

  let OutputKeyPrefix = 'videos/';
  let output = {
    Key: outputFile, //'file11.mp4',
    PresetId: PresetId
  };
  if (options.addWatermark) {
    output.Watermarks = [
      {
        InputKey: options.watermarkFile || 'images/watermark.png',
        PresetWatermarkId: 'BottomRight'
      }
    ]
  }

  let params = {
    PipelineId: config.elasticTranscoder.pipelineId,
    Input: {
      Key: inputFile //'video.mp4'
    },
    Output: output,
    OutputKeyPrefix: OutputKeyPrefix
  };

  elastictranscoder.createJob(params, function(err, data) {
    if (err) {
       return cb(err);
    }

    cb(null, {
      url: 'https://' + config.S3.bucket + '.s3-' + config.AWS.region + '.amazonaws.com/' + OutputKeyPrefix + outputFile
    });
  });
};

exports.createClip = function(options, cb) {
  var inputFile = options.inputFile;
  var outputFile = StringHelper.getFileName(options.outputFile.replace(/^\/|\/$/g, ''), true) + '.mp4';
  //change to mp4 ext
  var PresetId = '1351620000001-000061';
  //https://docs.aws.amazon.com/elastictranscoder/latest/developerguide/create-job.html
  let OutputKeyPrefix = 'clips/';
  let params = {
    PipelineId: config.elasticTranscoder.pipelineId,
    Input: {
      Key: inputFile,
      TimeSpan: {
        StartTime: options.fromTime || '0',
        Duration: '00:00:20'
      }
    },
    Output: {
      Key: outputFile, //'file11.mp4',
      PresetId: PresetId
    },
    OutputKeyPrefix: OutputKeyPrefix
  };

  elastictranscoder.createJob(params, function(err, data) {
    if (err) {
       return cb(err);
    }

    cb(null, {
      url: 'https://' + config.S3.bucket + '.s3-' + config.AWS.region + '.amazonaws.com/' + OutputKeyPrefix + outputFile
    });
  });
};
