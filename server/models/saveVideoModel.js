'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var saveVideoSchema = new Schema({
  user: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
  },
  video: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'VideoModel'
  },
  type: {
    type: String,
    enum: ['favorites', 'watchlater']
  },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  }
}, {
  collection: 'saveVideos',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

/**
 * Pre-save hook
 */
saveVideoSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('saveVideoModel', saveVideoSchema);
