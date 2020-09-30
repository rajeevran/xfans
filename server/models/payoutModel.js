'use strict';

import mongoose, { Schema } from 'mongoose';
import PerformerModel from './performerModel';
import UserModel from './userModel';
import { Queue } from '../components';
import async from 'async';
import moment from 'moment';

var Payoutschema = new Schema({
  title: String,
  alias: String,
  description: String,
  startDate: {
  	type: Date, default: Date.now
  },
  endDate: {
  	type: Date, default: Date.now
  },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  },
  performer: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'PerformerModel'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  }
});

/**
 * Pre-save hook
 */
Payoutschema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.wasNew = true;
    } else {
      this.updatedAt = new Date();
    }
    this.alias = this.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');
    next();
  });

Payoutschema.post('save', function(doc, next) {
  if (!this.wasNew) {
    return next();
  }

  async.auto({
    performer(cb) {
      PerformerModel.findOne({
        performer: doc.performer
      }, cb);
    },
    user(cb) {
      UserModel.findOne({
        role: 'admin'
      });
    }
  }, function(err, result) {
    if (err || !result.performer || !result.user) {
      return next();
    }

    Queue.create('SEND_MAIL', {
      title: 'Performer ' + result.performer.name + ' send a payout request.',
      to: result.user.email,
      template: 'requestPayout.html',
      data: {
        admin: result.user.toObject(),
        performer: result.performer.toObject(),
        payout: doc.toObjecct(),
        fromDate: moment(doc.startDate).format('DD/MM/YYYY'),
        endDate: moment(doc.endDate).format('DD/MM/YYYY')
      }
    }).save();

    next();
  });
});

module.exports = mongoose.model('PayoutModel', Payoutschema);
