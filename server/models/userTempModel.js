'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var UserTempSchema = new Schema({
  email: String,
  name: String,
  password: String,
  package: String
}, {
  collection: 'userTemps',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

/**
 * Pre-save hook
 */
UserTempSchema
  .pre('save', function(next) {    
    next();
  });

module.exports = mongoose.model('UserTempModel', UserTempSchema);
