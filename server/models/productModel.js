'use strict';

import mongoose, { Schema } from 'mongoose';

var SchemaTypes = mongoose.Schema.Types;
var ProductSchema = new Schema({
  name: String,
  alias: String,
  description: String,
  imageFullPath: String,
  imageThumbPath: String,
  imageMediumPath: String,
  imageType: {
    type: String,
    enum: ['s3', 'direct']
  },
  sort: Number,
  user: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
  },
  price: Number,
  quantity: Number,
  pricePromotion: { type: Number, default: 0 },
  allowApplyCoupon: { type: Boolean, default: true },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive']
  },
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategoryModel',
    default: []
  }],
  categoriesInfo: [{
    type: mongoose.Schema.Types.Mixed
  }],
  performerId: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'PerformerModel'
  }
}, {
  collection: 'products',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
ProductSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    this.alias = this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');

    if (!this.categoryIds || !this.categoryIds.length) {
      this.categories = [];
      return next();
    }

    let _this = this;
    var CategoryModel = require('./productCategory');
    CategoryModel.find({
      _id: {
        $in: this.categoryIds
      }
    }, function(err, categories) {
      if (!err) {
        _this.categoriesInfo = categories;
      }

      next();
    });
  });

module.exports = mongoose.model('ProductModel', ProductSchema);
