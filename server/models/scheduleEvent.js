'use strict';

import mongoose, { Schema } from 'mongoose';

var ScheduleModel = new Schema({
  performerId: mongoose.Schema.Types.ObjectId, //this is user
  title: String,
  description: String,
  date: Date,
  from: Date,
  to: Date,
  type: {
    type: String
  },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  }
}, {
  collection: 'scheduleEvent',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
ScheduleModel
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('ScheduleModel', ScheduleModel);
