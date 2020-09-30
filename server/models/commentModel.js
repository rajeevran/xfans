'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var CommentSchema = new Schema({
  content: String,
  user: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
  },
  video: {
    type: mongoose.Schema.Types.ObjectId, ref: 'VideoModel'
  },
  performer: {
    type: mongoose.Schema.Types.ObjectId, ref: 'PerformerModel'
  },
  payout: {
    type: mongoose.Schema.Types.ObjectId, ref: 'PayoutModel'
  },
  type: {
        type: String,
        enum: ['video', 'performer', 'payout']
      },
  createdAt: {
    type: Date, default: Date.now
  },
  updatedAt: {
    type: Date, default: Date.now
  },
  status: {
        type: String,
        enum: ['active', 'inactive']
      }
}, {
  collection: 'comments',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

/**
 * Pre-save hook
 */
CommentSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('CommentModel', CommentSchema);
