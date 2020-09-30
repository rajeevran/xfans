'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { Queue, VideoConverter } from '../components';
import { StringHelper } from '../helpers';
import async from 'async';
import path from 'path';
import config from '../config/environment';

const AffiliateContent = new Schema({
  name: String,
  description: String,
  filePath: String,
  performer: { type : mongoose.Schema.Types.ObjectId, ref: 'PerformerModel' },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  fileType: {
    type: String,
    default: 'direct'
  },
  convertStatus: {
    type: String,
    enum: ['pending', 'processing', 'done'],
    default: 'pending'
  },
  duration: {
    type: Number,
    default: 0
  },
  addedWatermark: {
    type: Boolean,
    default: true
  },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  }
}, {
  restrict: true,
  minimize: false
});


/**
 * Pre-save hook
 */
AffiliateContent.pre('save', function(next) {
  if (this.isNew) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  } else {
    this.updatedAt = new Date();
  }
  const _this = this;
  async.auto({
    duration(cb) {
      if (!_this.filePath || StringHelper.isUrl(_this.filePath)) {
        return cb();
      }
      let filePath = path.join(config.clientFolder, _this.filePath);
      VideoConverter.getDuration(filePath, function(err, duration) {
        if (!err) {
          _this.duration = duration;
        }

        cb();
      });
    }
  }, () => next());
});

AffiliateContent.post('save', function(doc) {
  if (doc.filePath && doc.convertStatus === 'pending' && !StringHelper.isUrl(doc.filePath)) {
    Queue.create('CONVERT_AFFILIATE_CONTENT', doc.toObject()).save();
  }
});

module.exports = mongoose.model('AffiliateContent', AffiliateContent);
