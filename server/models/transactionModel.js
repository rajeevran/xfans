'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';
var ObjectId = mongoose.Schema.Types.ObjectId;

var schema = new Schema({
  provider: {
    type: String,
    //enum: ['paypal', 'bitpay'],
    default: 'ccbill'
  },
  type: {
    type: String,
    //enum: ['Store', 'Membership Plan']
  },
  user: {
    type: ObjectId, ref: 'UserModel'
  },
  userId: {
    type: ObjectId, ref: 'UserTempModel'
  },
  performerId: {
    type: ObjectId, ref: 'PerformerModel'
  },
  subscriptionType: {
    type: String
  },
  products: [],
  price: Number,
  description: String,
  paymentInformation: {},
  coupon: {
    _id: {
      type: ObjectId, ref: 'CouponModel'
    },
    name: String,
    description: String,
    code: String,
    discountValue: Number,
    discountType: String
  },
  createdAt: {
    type: Date, default: Date.now
  },
  updatedAt: {
    type: Date, default: Date.now
  },
  status: {
    type: String,
    default: 'pending'
  }
}, {
  collection: 'transactions',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

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

module.exports = mongoose.model('TransactionModel', schema);
