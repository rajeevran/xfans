'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  siteName: 'myadmirers.com',
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: true,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'mean-app-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    },
    uri: "mongodb://App20xfans:LogIn20xfans@161.35.161.93:27017/admin"
   
  },


  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  twitter: {
    clientID:     process.env.TWITTER_ID || 'xdoaCJ6msDKWGJW8GcwGf9QbC',
    clientSecret: process.env.TWITTER_SECRET || 'ewv1TPWvP7tFMKMB9Vu6yofm90GEawunCuhtY2pd6PPBscS2Cq',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
  },
  sendgrid: {
    apiKey: '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'
  },
  emailFrom:'rajeevranjan.brainium@gmail.com',
  adminEmail: 'rajeevranjan.brainium@gmail.com',
  imageType: process.env.IMAGE_TYPE || 'direct',
  fileType: process.env.FILE_TYPE || 'direct',
  local: {
    database: "mongodb://localhost:27017/calaf",
    MAIL_USERNAME: "liveapp.brainium@gmail.com",
    MAIL_PASS: "YW5kcm9pZDIwMTY"
  },
  liveUrl: 'http://161.35.161.93:9000/'
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
