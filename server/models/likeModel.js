'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var LikeSchema = new Schema({
  user: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
  },
  video: {
    type: mongoose.Schema.Types.ObjectId, ref: 'VideoModel'
  },
  createdAt: {
    type: Date, default: Date.now
  },
  updatedAt: {
    type: Date, default: Date.now
  }
}, {
  collection: 'like',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
LikeSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('LikeModel', LikeSchema);
