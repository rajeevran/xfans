'use strict';

// Production specific configuration
// =================================
var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  siteName: 'myadmirers.com',
  app: {
    name: 'myadmirers'
  },
  baseUrl: process.env.BASE_URL || 'https://myadmirers.com/',
  // Server IP
  ip:     process.env.OPENSHIFT_NODEJS_IP ||
          process.env.IP ||
          undefined,

  // Server port
  port:   process.env.OPENSHIFT_NODEJS_PORT ||
          process.env.PORT ||
          8080,

  // MongoDB connection options
  mongo: {
    uri:  process.env.MONGODB_URI ||
          process.env.MONGOHQ_URL ||
          process.env.OPENSHIFT_MONGODB_DB_URL +
          process.env.OPENSHIFT_APP_NAME ||
          'mongodb://m3jgYM8RyIs:m3FCaRiTmpy@localhost/m3jgYM8RyIs'
  },
  redis: {
    port: 6379,
    host: '161.35.161.93',
    db: 3, // if provided select a non-default redis db
    options: {
      // see https://github.com/mranney/node_redis#rediscreateclient
    }
  },
  AWS: {
    accessKeyId: 'sss',
    secretAccessKey: 'jxxx',
    region: 'us-west-1'
  },
  S3: {
    bucket: 'xxx'
  },
  elasticTranscoder: {
    pipelineId: ''
  },
  emailFrom: 'noreply@myadmirers.com',
  sessionSecret: 'app-secret',
  ES: {
    provider: 'aws',
    region: 'us-east-1',
    hosts: 'https://xxx.us-east-1.es.amazonaws.com',
    accessKeyId: null, //null will get AWS key
    secretAccessKey: null //null will get AWS key
  },
  //set / at the end
  avatarTempFolder: _path2.default.resolve(__dirname, '../../../client/assets/avatars/'),
  imageTempFolder: _path2.default.resolve(__dirname, '../../../client/uploads/images/'),
  fileTempFolder: _path2.default.resolve(__dirname, '../../../client/uploads/files/'),
  clientFolder: _path.resolve(__dirname, '../../../client/'),
  imageSmallSize: { width: 130, height: 100 },
  imageMediumSize: { width: 320, height: 240 },
  imageModelSmallSize: { width: 130, height: 180 },
  imageModelMediumSize: { width: 275, height: 350 },
  avatarSmallSize: { width: 135, height: 135 },
  avatarMediumSize: { width: 315, height: 315 },
  imageType: 'direct', //s3 or direct
  fileType: 'direct', //s3 or direct
  avatarTempBaseUrl: '/assets/avatars/',
  watermarkFile: _path2.default.resolve(__dirname, '../../assets/watermark.png'),
  tmpFolder: _path2.default.resolve(__dirname, '../../assets/.tmp'),
  useCluster: false,
  useLiverload: false,
  xssProtection: false,
  twitter: {
    clientID:     process.env.TWITTER_ID || 'xxx',
    clientSecret: process.env.TWITTER_SECRET || 'xxx',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },
  adminEmail: 'admin@myadmirers.com'
};
