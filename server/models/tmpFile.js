'use strict';

import mongoose from 'mongoose';
import {Schema} from 'mongoose';

var TmpFile = new Schema({
  filePath: String,
  createdAt: Date
}, {
  collection: 'tmpFiles'
});

TmpFile
  .pre('save', function(next) {
    this.createdAt = new Date();
    next();
  });

module.exports = mongoose.model('TmpFile', TmpFile);
