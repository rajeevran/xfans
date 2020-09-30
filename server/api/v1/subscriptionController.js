'use strict';

import async from 'async';
import { UserSubscriptionModel, UserModel, SettingModel, PerformerModel } from '../../models';
import moment from 'moment-timezone';
import _ from 'lodash';
import md5 from 'md5';
let dateChunk = require('chunk-date-range');

exports.checkSubscribeMiddleware = function(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }

  UserSubscriptionModel.count({
    userId: req.user._id,
    performerId: req.params.performerId,
    expiredDate: {
      $gt: new Date()
    }
  }, function(err, count) {
    let subscribed = !err && count;
    if (!subscribed) {
      return res.status(403).send();
    }

    next();
  });
};

exports.checkSubscribe = function(req, res) {
  UserSubscriptionModel.count({
    userId: req.user._id,
    performerId: req.params.performerId,
    expiredDate: {
      $gt: new Date()
    }
  }, function(err, count) {
    let subscribed = !err && count;
    res.status(200).send({ subscribed });
  });
};

exports.updateSubcribe = function(req, res) {
  if(req.user.role !== 'admin') {
    return res.status(422).send({message: 'Invalid role.'});
  }

  UserSubscriptionModel.findOne({
    userId: req.body.userId,
    performerId: req.body.performerId,
    expiredDate: {
      $gt: new Date()
    }
  }, function(err, result) {
    if (err) {
      return res.status(500).send(err);
    }

    let subscribed = !err && result;
    if (!subscribed) {
      var subscription = new UserSubscriptionModel({
        userId: req.body.userId,
        performerId: req.body.performerId,
        subscriptionType: 'system',
        registerDate: new Date(),
        expiredDate: req.body.expiredDate,
        price: 0
      });

      subscription.save((err, data) => res.status(err ? 500 : 200).send(data || err));
    }else {
      subscribed.expiredDate = req.body.expiredDate;
      subscribed.save((err, data) => res.status(err ? 500 : 200).send(data || err));
    }
  });
};

exports.countByPerformer = function(req, res) {
  async.auto({
    all(cb) {
      UserSubscriptionModel.count({
        performerId: req.params.performerId
      }, cb);
    },
    valid(cb) {
      UserSubscriptionModel.count({
        performerId: req.params.performerId,
        expiredDate: {
          $gt: new Date()
        }
      }, cb);
    }
  }, function(err, result) {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(result);
  });
};

exports.subscribers = function(req, res) {
  let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
  let take = parseInt(req.query.take) || 10;
  let query = {
    expiredDate: {
      $gte: new Date()
    }
  };
  if (req.query.performerId) {
    query.performerId = req.query.performerId;
  }

  async.auto({
    count(cb) {
      UserSubscriptionModel.count(query, cb);
    },
    subscriptions(cb) {
      UserSubscriptionModel
      .find(query)
      .skip(page * take)
      .limit(take)
      .exec(cb);
    },
    users: ['subscriptions', function(result, cb) {
      if (!result.subscriptions.length) {
        return cb(null, []);
      }

      let ids = result.subscriptions.map(s => s.userId);
      UserModel.find({
        _id: {
          $in: ids
        }
      }, cb);
    }]
  }, function(err, result) {
    if (err) {
      return res.status(500).send(err);
    }

    let items = result.users.map(user => {
      let data = user.publicProfile();
      data.subscription = _.find(result.subscriptions, s => s.userId.toString() === user._id.toString());
      return data;
    });
    res.status(200).send({
      count: result.count,
      items
    });
  });
};

exports.getSubscribedPerformers = function(req, res) {
  if (!req.user) {
    return res.status(200).send([]);
  }
  UserSubscriptionModel.find({
    userId: req.user._id,
    expiredDate: {
      $gt: new Date()
    }
  }, function(err, list) {
    if (err) {
      return res.status(200).send([]);
    }

    list.push({
      performerId: req.user._id,
      userId: req.user._id
    });
    res.status(200).send(list);
  });
};

exports.stats = function(req, res) {
  let startDate = req.query.startDate ? moment(req.query.startDate).tz('America/New_York').toDate() : moment().tz('America/New_York').add(-7, 'days').toDate();
  let endDate = req.query.endDate ? moment(req.query.endDate).tz('America/New_York').endOf('day').toDate() : moment().tz('America/New_York').toDate();

  let chunks = dateChunk(startDate, endDate, 'day');
  let data = [];
  async.eachSeries(chunks, function(chunk, cb) {
    UserSubscriptionModel.count({
      performerId: req.user._id,
      createdAt: {
        $lt: chunk.end,
        $gt: chunk.start
      }
    }, function(err, count) {
      data.push({
        start: chunk.start,
        end: chunk.end,
        count: err ? 0 : count
      });

      cb();
    });
  }, function() {
    res.status(200).send(data);
  });
};

exports.subscribeCCBill = function(req, res) {
  let subscriptionField = req.body.subscriptionType === 'monthly' ? 'formMonthSubscription' : 'formYearlySubscription';
  async.auto({
    setting(cb) {
      SettingModel.findOne({}, cb);
    },
    performer(cb) {
      PerformerModel.findOne({
        _id: req.body.performerId
      }, cb);
    }
  }, function(err, data) {
    if (err || !data.setting || !data.setting.saltSubscriptions || !data.performer || !data.performer.ccbill[subscriptionField]) {
      return res.status(400).send({
        msg: 'Not config ccbill yet'
      });
    }

    let flexForm = data.performer.ccbill[subscriptionField];
    let clientSubacc = data.performer.ccbill.subAccount;
    //https://kb.ccbill.com/Webhooks+User+Guide#Appendix_A:_Currency_Codes
    let currencyCode = '840'; //usd
    let salt = data.setting.saltSubscriptions;
    let formPeriod = 30;
    let price = '100.00'; //(req.body.type === 'monthly' ? data.performer.subscriptionMonthlyPrice : data.performer.subscriptionYearlyPrice).toFixed(2);
    let formDigest = md5(
      price + formPeriod + currencyCode + salt
    );

    let url = `https://api.ccbill.com/wap-frontflex/flexforms/${flexForm}?userId=${req.user._id}&initialPrice=${price}&initialPeriod=${formPeriod}&clientSubacc=${clientSubacc}&currencyCode=${currencyCode}&formDigest=${formDigest}`;
    res.status(200).send({
      redirectUrl: url
    });
  });
};
