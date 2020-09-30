'use strict';

import mongoose, {
  Schema
} from 'mongoose';
import _ from 'lodash';
import PerformerAlbumModel from './performerAlbum';

var schema = new Schema({
  name: String,
  alias: String,
  description: String,
  metaKeywords: String,
  metaDescription: String,
  metaTitle: String,
  imageFullPath: String,
  imageThumbPath: String,
  imageMediumPath: String,
  imageType: {
    type: String,
    enum: ['s3', 'direct']
  },
  images: [String],
  sort: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel'
  },
  performer: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PerformerModel',
    default: []
  }],
  //if empty, that means we have other album
  performerAlbumIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PerformerAlbumModel',
    default: []
  }],
  performerHaveAbumIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PerformerModel',
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  collection: 'photos',
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
    this.alias = this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
    let _this = this;

    if (this.performerAlbumIds && this.performerAlbumIds.length) {
      PerformerAlbumModel.find({
        _id: {
          $in: this.performerAlbumIds
        }
      }, function(err, albums) {
        _this.performerHaveAbumIds = [];

        if (err) {
          return next();
        }
        albums.forEach(function(album) {
          if (album.performerIds && album.performerIds.length) {
            album.performerIds.forEach(function(id) {
              _this.performerHaveAbumIds.push(id);
            });
          }
        });

        _this.performerHaveAbumIds = _.uniq(_this.performerHaveAbumIds);
        next();
      });
    } else {
      this.performerHaveAbumIds = [];
      next();
    }
  });

module.exports = mongoose.model('PhotoModel', schema);
