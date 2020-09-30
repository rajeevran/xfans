'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import moment from 'moment';
import async from 'async';
import _ from 'lodash';
import { Queue } from '../components';

var SubscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserModel' },
  performerId: { type: Schema.Types.ObjectId, ref: 'PerformerModel' },
  subscriptionType: {
    type: String
  },
  registerDate: { type: Date },
  expiredDate: { type: Date },
  price: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'usersubscription',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
SubscriptionSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }

    next();
  });

SubscriptionSchema.statics.updateUserSubscription = function(data, cb) {
  let SubscriptionLog = require('./UserSubscriptionLog');
  let PerformerModel = require('./performerModel');
  let UserModel = require('./userModel');
  let OrderModel = require('./orderModel');
  let EarningModel = require('./Earning');
  let This = this;
  this.findOne({
    userId: data.userId,
    performerId: data.performerId
  }, function(err, subscription) {
    if (err) {
      return cb(err);
    }

    if (!subscription) {
      subscription = new This({
        userId: data.userId,
        performerId: data.performerId
      });
    }
    subscription.subscriptionType = data.subscriptionType;
    subscription.registerDate = new Date();
    if (moment().isAfter(subscription.expiredDate)) {
      subscription.expiredDate = new Date();
    }
    let expDays = data.subscriptionType === 'monthly' ? 30 : 365;
    subscription.expiredDate = moment(subscription.expiredDate).add(expDays, 'days');
    subscription.save(function(err, saved) {
      if (err) {
        return cb(err);
      }

      //create order
      async.auto({
        performer(cb) {
          PerformerModel.findOne({
            _id: data.performerId
          }, cb);
        },
        user(cb) {
          UserModel.findOne({
            _id: data.userId
          }, cb);
        },
        order: ['performer', 'user', function(result, cb) {
          if (err || !result.performer || !result.user) {
            return cb(err);
          }

          let price = data.subscriptionType === 'monthly' ? result.performer.subscriptionMonthlyPrice : result.performer.subscriptionYearlyPrice;
          var order = new OrderModel({
            user: data.userId,
            description: (data.subscriptionType === 'monthly' ? 'Monthly' : 'Yearly') + ' subscription ' + result.performer.name,
            type: 'performer_subscription',
            quantity: 1,
            price: price,
            totalPrice: price,
            name: (result.user.firstName || '') + ' ' + (result.user.lastName || ''),
            address: '',
            email: result.user.email,
            phone: '',
            paymentInformation: data.transaction ? data.transaction.paymentInformation : null,
            transactionId: data.transaction ? data.transaction._id : null,
            performerId: data.performerId,
            status: 'active'
          });
          order.save(cb);
        }],
        earning: ['performer', function(result, cb) {
          if (!result.performer) {
            return cb('No performer');
          }

          let price = data.subscriptionType === 'monthly' ? result.performer.subscriptionMonthlyPrice : result.performer.subscriptionYearlyPrice;
          let type = data.subscriptionType === 'monthly' ? 'monthly_subscription' : 'yearly_subscription';
          EarningModel.addNew({
            type,
            price,
            performerId: data.performerId,
            userId: data.userId
          }, cb);
        }],
        subscriptionLog: ['performer', function(result, cb) {
          let price = data.subscriptionType === 'monthly' ? result.performer.subscriptionMonthlyPrice : result.performer.subscriptionYearlyPrice;
          let log = new SubscriptionLog({
            userId: saved.userId,
            performerId: saved.performerId,
            registerDate: saved.registerDate,
            expiredDate: saved.expiredDate,
            price,
          });
          log.save(cb);
        }]
      }, function(err, result) {
        if (result.user && result.performer) {
          Queue.create('SEND_MAIL', {
            title: 'New subscription.',
            to: result.performer.email,
            template: 'newSubscription.html',
            data: {
              performer: result.performer.toObject(),
              user: result.user.toObject(),
              data: data
            }
          }).save();
        }

        cb(null, saved);
      });
    });
  });
};

module.exports = mongoose.model('UserSubscriptionModel', SubscriptionSchema);
