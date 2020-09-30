'use strict';

import mongoose, { Schema } from 'mongoose';
import async from 'async';
import _ from 'lodash';

var schema = new Schema({
  name: String,
  alias: String,
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  collection: 'categories',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
schema
  .pre('save', function(next) {
    this.wasNew = this.isNew;
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    this.alias = this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');
    next();
  });

schema
  .post('save', function(doc) {
    if (this.wasNew) {
      return;
    }

    //update video collections with related categories
    var VideoModel = require('./videoModel');
    VideoModel.find({
      categories: {
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

        VideoModel.update({
          _id: product._id
        }, {
          $set: {
            categoriesInfo: categoriesInfo
          }
        }, () => {});
      });
    });
  });

schema.post('remove', function(doc) {
  //update video collections with related categories
  var VideoModel = require('./videoModel');
  VideoModel.find({
    categories: {
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

      VideoModel.update({
        _id: product._id
      }, {
        $set: {
          categories: categoryIds,
          categoriesInfo: categoriesInfo
        }
      }, () => {});
    });
  });
});

module.exports = mongoose.model('CategoryModel', schema);
