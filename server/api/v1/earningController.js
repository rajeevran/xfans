'use strict';

import { EarningModel, PerformerModel, UserModel } from '../../models';
import _ from 'lodash';
import async from 'async';
import moment from 'moment';
import mongoose from 'mongoose';

exports.search = function(req, res) {
  let query = {};
  let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
  let take = parseInt(req.query.take) || 10;
  if (req.user.role !== 'admin' && !req.isPerformer) {
    return res.status(403).end();
  }

  if (req.user.role !== 'admin') {
    query.performerId = req.user._id;
  } else if (req.query.performerId) {
    query.performerId = req.query.performerId;
  }

  if (req.query.dateFrom && req.query.dateTo) {
    query.createdAt = {
      $gte: moment(req.query.dateFrom).startOf('day').toDate(),
      $lte: moment(req.query.dateTo).endOf('day').toDate()
    };
  }

  if (req.query.type) {
    query.type = req.query.type;
  }

  async.parallel({
    count(cb) {
      EarningModel.count(query, cb);
    },
    items(cb) {
      EarningModel.find(query)
        .skip(page * take)
        .limit(take)
        .sort({ createdAt: -1 })
        .exec(cb);
    }
  }, (err, result) => {
    if (err) { return res.status(500).send(err); }

    res.status(200).json(result);
  });
};

exports.stats = function(req, res) {
  let query = {};
  if (req.user.role !== 'admin' && !req.isPerformer) {
    return res.status(403).end();
  }

  if (req.user.role !== 'admin') {
    query.performerId = mongoose.Types.ObjectId(req.user._id);
  } else if (req.query.performerId && req.user.role === 'admin') {
    query.performerId = mongoose.Types.ObjectId(req.query.performerId)
  }

  if (req.query.dateFrom && req.query.dateTo) {
    query.createdAt = {
      $gte: moment(req.query.dateFrom).tz('America/New_York').startOf('day').toDate(),
      $lte: moment(req.query.dateTo).tz('America/New_York').endOf('day').toDate()
    };
  }

  if (req.query.type) {
    query.type = req.query.type;
  }

  async.auto({
    total(cb) {
      EarningModel.aggregate([
        {
          $match: query
        },
        {
          $group: {
            _id: null,
            priceOriginal: { $sum: '$priceOriginal' },
            priceReceive: { $sum: '$priceReceive' },
            pricePay: { $sum: '$pricePay' }
          }
        }
      ], cb);
    },
    payout(cb) {
      let query1 = _.clone(query);
      query1.paid = true;
      EarningModel.aggregate([
        {
          $match: query1
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricePay' }
          }
        }
      ], cb);
    },
    remaining(cb) {
      let query1 = _.clone(query);
      query1.paid = false;
      EarningModel.aggregate([
        {
          $match: query1
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricePay' }
          }
        }
      ], cb);
    }
  }, function(err, result) {
    if (err) { return res.status(500).send(err); }
    let data = {
      priceOriginal: 0,
      priceReceive: 0,
      pricePay: 0,
      payout: 0,
      remaining: 0
    };

    if (result.total) {
      _.merge(data, result.total[0]);
    }
    if (result.payout && result.payout[0]) {
      data.payout = result.payout[0].total;
    }
    if (result.remaining && result.remaining[0]) {
      data.remaining = result.remaining[0].total;
    }
    res.status(200).send(data);
  });
};

exports.updatePaidPerformer = function(req, res) {
  if (!req.body.dateFrom || !req.body.dateTo) {
    return res.status(422).end();
  }

  let start = moment(req.body.dateFrom).startOf('day').toDate();
  let end = moment(req.body.dateTo).endOf('day').toDate();
  let query = {
    createdAt: {
      $gte: start,
      $lte: end
    }
  };
  if (req.body.performerId) {
    query.performerId = req.body.performerId;
  }

  EarningModel.update(query, {
    $set: {
      paid: req.body.paid
    }
  }, {
    multi: true
  }, function(err) {
    if (err) { return res.status(500).send(err); }
    res.status(200).send({
      success: true
    });
  });
};
