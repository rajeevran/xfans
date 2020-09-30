'use strict';
import path from 'path';

// Development specific configuration
// ==================================
module.exports = {
  baseUrl:  process.env.BASE_URL || 'http://localhost:9000/',
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/xfans-test'
  },

  redis: {
    port: 6379,
    host: '161.35.161.93',
    db: 3, // if provided select a non-default redis db
    options: {
      // see https://github.com/mranney/node_redis#rediscreateclient
    }
  },
  //AWS key
  AWS: {
    //http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html
    //chiizdev
    accessKeyId: 'xxx',
    secretAccessKey: 'xxx',
    region: 'us-east-1'
  },
  S3: {
    bucket: 'chiiz-assets'
  },
  emailFrom: 'noreply@app.com',
  sessionSecret: 'app-secret',
  ES: {
    provider: 'aws',
    region: 'us-east-1',
    hosts: 'https://xxx.us-east-1.es.amazonaws.com',
    accessKeyId: null, //null will get AWS key
    secretAccessKey: null //null will get AWS key
  },
  //set / at the end
  avatarTempFolder: path.resolve(__dirname, '../../../client/assets/avatars/'),
  avatarTempBaseUrl: '/assets/avatars/',
  watermarkFile: path.resolve(__dirname, '../../assets/watermark.png'),
  tmpFolder: path.resolve(__dirname, '../../assets/.tmp'),
  useCluster: false,
  useLiverload: false,
  xssProtection: false
};
