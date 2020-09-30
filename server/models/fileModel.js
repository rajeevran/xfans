'use strict';

import mongoose, { Schema } from 'mongoose';
import config from '../config/environment';
var schema = new Schema({
  name: String,
  description: String,
  mimeType: String,
  path: String,
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  }
}, {
  collection: 'files',
  restrict: true,
  minimize: false,
  toJSON: {
    virtuals: true
  }
});

/**
 * Pre-save hook
 */
schema.pre('save', function(next) {
  if (this.isNew) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  } else {
    this.updatedAt = new Date();
  }

  next();
});

schema
  .virtual('fileUrl')
  .get(function() {
    return config.baseUrl + 'uploads/files/' + this.path;
  });

module.exports = mongoose.model('FileModel', schema);
