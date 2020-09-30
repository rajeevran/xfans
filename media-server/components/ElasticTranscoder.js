const AWS = require('aws-sdk');
import config from '../config/environment';

var elastictranscoder = new AWS.ElasticTranscoder({
  apiVersion: '2012-09-25',
  region: 'us-west-1',// config.region,
  accessKeyId: 'AKIAISB6TO2D6B4BYL2Q', // config.accessKeyId,
  secretAccessKey: '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', //config.secretAccessKey
});

exports.convertVideo = function(options, cb) {
  var inputFile = options.inputFile;
  var outputFile = options.outputFile;
  var pipelineId = '1351620000001-000001';
  if (options.width >= 1080) {
    pipelineId = '1351620000001-000001'
  } else if (options.width >= 720) {
    pipelineId = '1351620000001-000010'
  } else if (options.width >= 480) {
    pipelineId = '1351620000001-000020';
  } else {
    pipelineId = '1351620000001-000061';
  }

  let OutputKeyPrefix = 'videos/';
  let params = {
    PipelineId: pipelineId,// config.pipelineId, /* required */
    Input: {
      Key: inputFile //'video.mp4'
    },
    Output: {
      Key: outputFile, //'file11.mp4',
      PresetId: '1351620000001-000010'
    },
    OutputKeyPrefix: OutputKeyPrefix
  };

  elastictranscoder.createJob(params, function(err, data) {
    if (err) {
       return cb(err);
    }

    cb(null, {
      url: 'https://s3-us-west-1.amazonaws.com/formyfans/' + OutputKeyPrefix + '/' + outputFile
    });
  });
};
