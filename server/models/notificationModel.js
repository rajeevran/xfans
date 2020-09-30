'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var NotificationSchema = new Schema({
  name: String,
  type: String,
  user: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
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
  collection: 'notifications',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

/**
 * Pre-save hook
 */
NotificationSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('NotificationModel', NotificationSchema);
