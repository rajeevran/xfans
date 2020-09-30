'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';
/**
 * type:
 0: Dowdloaded Items
 1: Watch later
 2: Favorites
 */
var BookmarkSchema = new Schema({
  user: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
  },
  video: {
    type: mongoose.Schema.Types.ObjectId, ref: 'VideoModel'
  },
  type: {
        type: String,
        enum: ['download', 'watchlater','favorite']
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
  collection: 'bookmarks',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

/**
 * Pre-save hook
 */
BookmarkSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('BookmarkModel', BookmarkSchema);
