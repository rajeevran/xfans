'use strict';

import mongoose, { Schema } from 'mongoose';
import CategoryModel from './categoryModel';
import PerformerAlbumModel from './performerAlbum';
import { StringHelper } from '../helpers';
import { Queue, VideoConverter } from '../components';
import async from 'async';
import config from '../config/environment';
import path from 'path';

var schema = new Schema({
  name: String,
  nameSearch: String,
  alias: String,
  description: String,
  metaKeywords: String,
  metaDescription: String,
  metaTitle: String,
  filePath: String,
  fileTrailerPath: String,
  imageFullPath: String,
  imageThumbPath: String,
  imageMediumPath: String,
  imageType: {
    type: String,
    enum: ['s3', 'direct']
  },
  fileType: {
    type: String,
    enum: ['s3', 'direct']
  },
  convertStatus: {
    trailer: {
      type: String,
      enum: ['pending', 'processing', 'done'],
      default: 'processing'
    },
    mainVideo: {
      type: String,
      enum: ['pending', 'processing', 'done'],
      default: 'processing'
    }
  },
  convertedFiles: [{
    name: String,
    width: Number,
    height: Number,
    path: String
  }],
  sort: Number,
  userVotes: [],
  categories: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'CategoryModel' }
  ],
  categoriesInfo: [
    { type: mongoose.Schema.Types.Mixed }
  ],
  photos: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'PhotoModel' }
  ],
  tags: [],
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
  },
  performer: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'PerformerModel' }
  ],
  photoAlbumId: {
    type: mongoose.Schema.Types.ObjectId
  },
  stats: {
    totalLike: { type: Number, default: 0 },
    totalComment: { type: Number, default: 0 },
    totalView: { type: Number, default: 0 }
  },
  isDownloaded: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isSchedule: {
    type: Boolean,
    default: false
  },
  schedule: Date,
  createdAt: {
    type: Date, default: Date.now
  },
  updatedAt: {
    type: Date, default: Date.now
  },
  type: {
    type: String,
    enum: ['recent', 'upcoming'],
    default: 'upcoming'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  //duration for main file
  duration: {
    type: Number,
    default: 0
  },
  thumbs: [{
    type: String
  }],
  isSaleVideo: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  allowViewSaleIds: [],
  showHome: {
    type: Boolean,
    default: true
  },
  brokenFile: {
    type: Boolean,
    default: false
  },
  clipUrl: {
    type: String
  },
  customTwitterTextVideo: {
    type: String,
    default: ''
  },
  activeDate: {
    type: Date,
    default: Date.now
  }
}, {
    collection: 'videos',
    restrict: true,
    minimize: false,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  });

schema.index({ nameSearch: 'text' });

schema
  .virtual('userInfo')
  .set(function (info) {
    this._userInfo = info;
  })
  .get(function () {
    return this._userInfo;
  });

schema.virtual('createVideoThumb')
  .set(function (val) {
    this._createVideoThumb = val;
  })
  .get(function () {
    return this._createVideoThumb;
  });

schema.virtual('deleteOldFile')
  .set(function (val) {
    this._deleteOldFile = val;
  })
  .get(function () {
    return this._deleteOldFile || true;
  });

/**
 * Pre-save hook
 */
schema
  .pre('save', function (next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    this.alias = this.name ? this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-') : '';
    this.nameSearch = this.name;
    if (this.imageThumbPath === 'null') {
      this.imageThumbPath = '';
    }
    if (this.imageFullPath === 'null') {
      this.imageFullPath = '';
    }
    if (this.imageMediumPath === 'null') {
      this.imageMediumPath = '';
    }

    if (this.isModified('filePath') && this.filePath && config.fileType === 'direct') {
      this.convertStatus.mainVideo = 'pending';
    } else {
      this.convertStatus.mainVideo = 'done';
    }

    if (this.isModified('fileTrailerPath') && this.fileTrailerPath && StringHelper.getExt(this.fileTrailerPath).toLowerCase() !== '.mp4' && config.fileType === 'direct') {
      this.convertStatus.trailer = 'pending';
    } else {
      this.convertStatus.trailer = 'done';
    }

    this._modifiedStatus = this.isModified('status');
    this._modifiedFilePath = this.isModified('filePath');

    if (this.isModified('status') && this.status === 'active') {
      this.activeDate = new Date();
    }

    let _this = this;
    async.auto({
      categories(cb) {
        if (!_this.categories || !_this.categories.length) {
          _this.categoriesInfo = [];
          return cb();
        }

        CategoryModel.find({
          _id: {
            $in: _this.categories
          }
        }, function (err, categories) {
          if (!err) {
            _this.categoriesInfo = categories;
          }

          cb();
        });
      },
      // duration(cb) {
      //   if (!_this.filePath || StringHelper.isUrl(_this.filePath) || config.fileType !== 'direct') {
      //     return cb();
      //   }
      //   let filePath = path.join(config.clientFolder, _this.filePath);
      //   VideoConverter.getDuration(filePath, function (err, duration) {
      //     if (!err) {
      //       _this.duration = duration;
      //     }

      //     cb();
      //   });
      // }
    }, () => next());
  });

schema
  .post('save', function (doc) {
    if (doc.photoAlbumId) {
      PerformerAlbumModel.update({
        _id: doc.photoAlbumId
      }, {
          isActive: !doc.isSchedule
        }, function () { });
    }

    // if (doc.filePath && doc.convertStatus.mainVideo === 'pending' && !StringHelper.isUrl(doc.filePath)) {
    //   Queue.create('CONVERT_MAIN_VIDEO', {
    //     videoId: doc._id,
    //     filePath: doc.filePath,
    //     key: 'mainVideo',
    //     createVideoThumb: doc.createVideoThumb,
    //     deleteOldFile: doc.deleteOldFile
    //   }).save();
    // }

    // if (doc.filePath && !StringHelper.isUrl(doc.filePath) && !doc.imageFullPath) {
    //   //create thumb for mp4
    //   Queue.create('CREATE_THUMB', {
    //     videoId: doc._id,
    //     filePath: doc.filePath
    //   }).save();
    // }

    // if (doc.fileTrailerPath && doc.convertStatus.trailer === 'pending' && !StringHelper.isUrl(doc.filePath)) {
    //   Queue.create('CONVERT_TRAILER_VIDEO', {
    //     videoId: doc._id,
    //     filePath: doc.fileTrailerPath,
    //     key: 'trailer',
    //     deleteOldFile: doc.deleteOldFile
    //   }).save();
    // }

    if (doc.filePath && !StringHelper.isUrl(doc.filePath)) {
      Queue.create('CREATE_THUMBS', {
        videoId: doc._id,
        filePath: doc.filePath
      }).save();
    }

    // if (doc.status === 'active' && doc._modifiedStatus && doc.clipUrl && doc.performer && doc.performer.length) {
    //   Queue.create('AUTO_POST_TWITTER', {
    //     videoId: doc._id,
    //     performerId: doc.user
    //   }).save();
    // }
  });

module.exports = mongoose.model('VideoModel', schema);
