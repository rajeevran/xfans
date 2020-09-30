'use strict';

import mongoose, { Schema } from 'mongoose';
import async from 'async';
import _ from 'lodash';

var SchemaTypes = mongoose.Schema.Types;
var modelSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  totalProduct: {
    type: String, default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'productCategories',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
modelSchema
  .pre('save', function(next) {
    this.wasNew = this.isNew;
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

modelSchema
  .post('save', function(doc) {
    if (this.wasNew) {
      return;
    }

    //update video collections with related categories
    var ProductModel = require('./productModel');
    ProductModel.find({
      categoryIds: {
        $in: [doc._id]
      }
    }, function(err, items) {
      if (err) {
        return;
      }

      async.eachSeries(items, function(product, cb) {
        let index = _.findIndex(product.categoriesInfo, function(info) {
          return info._id && info._id.toString() === doc._id.toString();
        });
        if (index < 0) {
          return cb();
        }
        var categoriesInfo = product.categoriesInfo;
        categoriesInfo[index] = doc;

        ProductModel.update({
          _id: product._id
        }, {
          $set: {
            categoriesInfo: categoriesInfo
          }
        }, () => {});
      });
    });
  });

modelSchema.post('remove', function(doc) {
  //update video collections with related categories
  var ProductModel = require('./productModel');
  ProductModel.find({
    categoryIds: {
      $in: [doc._id]
    }
  }, function(err, items) {
    if (err) {
      return;
    }

    async.eachSeries(items, function(product, cb) {
      let categoryIds = _.filter(product.categories, function(id) {
        return id.toString() !== doc._id.toString();
      });
      let index = _.findIndex(product.categoriesInfo, function(info) {
        return info._id && info._id.toString() === doc._id.toString();
      });
      var categoriesInfo = product.categoriesInfo;
      if (index > -1) {
        categoriesInfo.splice(index, 1);
      }

      ProductModel.update({
        _id: product._id
      }, {
        $set: {
          categoryIds: categoryIds,
          categoriesInfo: categoriesInfo
        }
      }, () => {});
    });
  });
});

module.exports = mongoose.model('ProductCategoryModel', modelSchema);
