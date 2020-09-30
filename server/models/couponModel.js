'use strict';

import mongoose, { Schema } from 'mongoose';

var schema = new Schema({
  name: String,
  description: String,
  isActive: {
    type: Boolean, default: true
  },
  discountValue: {
    type: Number, default: 0
  },
  discountType: {
    type: String,
    enum: ['amount', 'percentage']
  },
  code: {
    type: String
  },
  used: {
    type: Number, default: 0
  },
  useMultipleTimes: {
    type: Boolean, default: true
  },
  numberUse: {
    type: Number, default: 0
  },
  expiredDate: { type: Date },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'ProductModel'
  }],
  createdAt: {
    type: Date, default: Date.now
  },
  updatedAt: {
    type: Date, default: Date.now
  }
}, {
    collection: 'coupons',
    restrict: true,
    minimize: false
  });

/**
 * Pre-save hook
 */
schema.pre('save', function (next) {
  if (this.isNew) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  } else {
    this.updatedAt = new Date();
  }

  if (!this.code) {
    this.code = Math.random().toString(36).substring(7);
  }

  next();
});

module.exports = mongoose.model('CouponModel', schema);
