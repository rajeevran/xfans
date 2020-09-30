'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var MemberShipPackageSchema = new Schema({
  name: String,
  priceCode: String,
  description: String,
  detail: String,
  imagePath: String,
  sort: Number,
  price: Number,
  type: {
        type: String,
        enum: ['subscriptions', 'single'],
        default: 'subscriptions'
      },
  pricePromotion: Number,
  numberDay: Number,
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
  },{
  collection: 'memberShipPackages',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

/**
 * Pre-save hook
 */
MemberShipPackageSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('MemberShipPackageModel', MemberShipPackageSchema);
