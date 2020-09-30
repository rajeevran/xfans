'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var BannerSchema = new Schema({
  name: String,
  alias: String,
  description: String,
  link: String,
  imageFullPath: String,
  imageThumbPath: String,
  imageMediumPath: String,
  imageType: {
        type: String,
        enum: ['s3', 'direct']
      },
  sort: Number,
  type: String,
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  },
  status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
      }
}, {
  collection: 'banners',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

/**
 * Pre-save hook
 */
BannerSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    this.alias = this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');
    next();
  });

module.exports = mongoose.model('BannerModel', BannerSchema);
