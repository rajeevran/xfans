'use strict';

import mongoose, { Schema } from 'mongoose';

var schema = new Schema({
  name: String,
  alias: String,
  description: String,
  metaKeywords: String,
  metaDescription: String,
  metaTitle: String,
  latestPhotosIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PhotoModel'
  }],
  performerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PerformerModel'
  }],
  totalPhoto: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['performer', 'video'],
    default: 'performer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'performerAlbums',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
schema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }

    next();
  });


module.exports = mongoose.model('PerformerAlbumModel', schema);
