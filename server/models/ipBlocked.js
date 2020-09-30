'use strict';

import mongoose, { Schema } from 'mongoose';

var schema = new Schema({
  ip: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date, default: Date.now
  }
}, {
    collection: 'ipBlocked',
    restrict: true,
    minimize: false
  });

module.exports = mongoose.model('IPBlocked', schema);
