'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
import {Schema} from 'mongoose';
import { PerformerModel } from './performerModel';
import { UserModel } from './userModel';

var BlockSchema = new Schema({
  userId: String,
  description: String,
  objectId: String,
  objectInfo: { type : mongoose.Schema.Types.Mixed },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  }
}, {
  collection: 'blockModels',
  restrict: true,
  minimize: false
});


/**
 * Pre-save hook
 */
BlockSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('BlockPerformerModel', BlockSchema);
