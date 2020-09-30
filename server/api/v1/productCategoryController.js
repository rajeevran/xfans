'use strict';

import { ProductCategoryModel, ProductModel } from '../../models';
import _ from 'lodash';
import async from 'async';

exports.list = function(req, res) {
  let query = {};

  async.parallel({
    count(cb) {
      ProductCategoryModel.count(query, cb);
    },
    items(cb) {
      ProductCategoryModel.find(query)
        .sort({ name: 1 })
        .exec(function(err, items) {
          if (err) { return cb(err); }
          if (!req.user || req.user.role !== 'admin') {
            return cb(err, items);
          }

          let results = [];
          async.eachSeries(items, function(item, cb) {
            let data = item.toJSON();
            ProductModel.count({
              categoryIds: {
                $in: [item._id]
              }
            }, function(err, count) {
              data.totalProduct = count || 0;
              results.push(data);

              cb();
            });
          }, () => cb(null, results));
        });
    }
  }, (err, result) => {
    if (err) { return res.status(500).send(err); }

    res.status(200).json(result);
  });
};

exports.create = function(req, res) {
  let item = new ProductCategoryModel(req.body);
  item.save((err, data) => res.status(err ? 500 : 200).send(data));
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

exports.middlewares = {
  findOne(req, res, next) {
    ProductCategoryModel.findOne({ _id: req.params.id }, function(err, data) {
      if (err || !data) {
        return res.status(404).send(err);
      }

      req.category = data;
      next();
    });
  }
};
