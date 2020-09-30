'use strict';

import { CouponModel, OrderModel } from '../../models';
import _ from 'lodash';
import async from 'async';

exports.list = function(req, res) {
  let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
  let take = parseInt(req.query.take) || 10;
  let query = {};

  async.parallel({
    count(cb) {
      CouponModel.count(query, cb);
    },
    items(cb) {
      CouponModel.find(query)
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

exports.create = function(req, res) {
  let item = new CouponModel(req.body);
  item.save((err, data) => res.status(err ? 500 : 200).send(data || err));
};

exports.update = function(req, res) {
  delete req.body._id;
  req.category = _.merge(req.category, req.body);
  req.category.save((err, data) => res.status(err ? 500 : 200).send(data));
};

exports.delete = function(req, res) {
  req.category.remove(err => res.status(err ? 500 : 200).send({ success: err ? false : true }));
};

exports.findOne = function(req, res) {
  res.status(200).send(req.category);
};

exports.findByCode = function(req, res) {
  CouponModel.findOne({ code: req.query.code, isActive: true }, function(err, data) {
    if (err || !data) {
      return res.status(404).send('Your coupon code not found');
    }
    if(data.useMultipleTimes){
      res.status(200).send(data);
    }else{
      OrderModel.find({'coupon.code': data.code}, function(err, data){
        if(err || data.length){
          return res.status(400).send('You can\'t use this coupon code');
        }
        res.status(200).send({
          code: data.code,
          discountValue: data.discountValue,
          discountType: data.discountType
        });
      });
    }
  });
};

exports.middlewares = {
  findOne(req, res, next) {
    CouponModel.findOne({ _id: req.params.id }, function(err, data) {
      if (err || !data) {
        return res.status(404).send(err);
      }

      req.category = data;
      next();
    });
  }
};
