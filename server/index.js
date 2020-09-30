'use strict';

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//bluebird config
process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;
process.env.BLUEBIRD_WARNINGS = 0;

if (env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('babel-register');
}

// Export the application
exports = module.exports = require('./app');
