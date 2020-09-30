'use strict';

import mongoose, { Schema } from 'mongoose';

var schema = new Schema({
  name: String,
  code: String,
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

module.exports = mongoose.model('CountryBlock', schema);
