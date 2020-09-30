'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var OrderSchema = new Schema({
  description: String,
  name: String,
  address: String,
  email: String,
  phone: String,
  type: {
    type: String,
    //enum: ['Store', 'Membership Plan']
  },
  provider: {
    type: String,
    //enum: ['paypal', 'bitpay', 'ccbill'],
    default: 'ccbill'
  },
  user: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
  },
  performerId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'PerformerModel'
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'VideoModel'
  },
  expireDate:{
    type: Date
  },
  totalPrice: Number,
  price: Number,
  quantity: Number,
  paymentInformation: {},
  transactionId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'TransactionModel'
  },
  coupon: {
    _id: {
      type: mongoose.Schema.Types.ObjectId, ref: 'CouponModel'
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
    enum: ['active', 'inactive']
  }
}, {
  collection: 'orders',
  restrict: true,
  minimize: false
});

/**
 * Validations
 */

/**
 * Pre-save hook
 */
OrderSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('OrderModel', OrderSchema);
