'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';

var RequestLogSchema = new Schema({
  userId: mongoose.Schema.Types.ObjectId, //this is user
  path: {
    type: String
  },
  query: {
    type: Schema.Types.Mixed
  },
  reqHeader: {
    type: Schema.Types.Mixed
  },
  reqBody: {
    type: Schema.Types.Mixed
  },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  }
}, {
  collection: 'requestlogs',
  restrict: true,
  minimize: false
});

module.exports = mongoose.model('RequestLog', RequestLogSchema);
