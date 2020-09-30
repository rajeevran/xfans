'use strict';

import { ProductModel, ProductCategoryModel } from '../../models';
import { ProductBusiness } from '../../businesses';
import { ProductValidator, parseJoiError } from '../../validators';
import passport from 'passport';
import config from '../../config/environment';
import { S3, GM, Uploader } from '../../components';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import async from 'async';
import path from 'path';
import fs from 'fs';
import { UtilsHelper } from '../../helpers';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

class ProductController {
  /**
   * Get list of Products
   */
  static index(req, res) {

    if(req.query.limit!='undefined'){
        req.query.limit = parseInt(req.query.limit);
    }
    if(req.query.offset!='undefined'){
        req.query.offset = parseInt(req.query.offset);
    }
    return ProductBusiness.find(req.query)
      .then(products => {
        let items = [];
        async.eachSeries(products, function(product, cb) {
          let item = product.toJSON();
          if (!product.categoryIds || !product.categoryIds.length) {
            items.push(item);
            return cb();
          }

          ProductCategoryModel.find({
            _id: {
              $in: product.categoryIds
            }
          }, function(err, categories) {
            if (!err) {
              item.categories = categories;
            }
            items.push(item);
            cb();
          });
        }, function(err) {
          if (err) {
            return res.status(500).end();
          }

          res.status(200).send(items);
        });
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Product
   */
  static create(req, res, next) {
    ProductValidator.validateCreating(req.body).then(data => {
      let user = req.user.toObject();
      user.isPerformer = req.isPerformer;
      ProductBusiness.create(data, user).then(function(product) {
        product.imageType = config.imageType;
        if (typeof req.files.file != 'undefined') {
          let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
          Func(req.files.file, req.user._id, function(err, result) {
            if (err) {
              return res.status(400).send(err);
            }

            _.merge(product, result);
            ProductBusiness.update(product)
              .then((product) => res.status(200).json(product))
          });
        } else {
          ProductBusiness.update(product)
            .then(() => res.status(200).json(product));
        }
      });
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Get a single Product
   */
  static show(req, res, next) {
    ProductBusiness.findOne({_id: req.params.id})
    .then(product => {
      if (!product) {
        return res.status(404).end();
      }

      if (!product.categoryIds || !product.categoryIds.length) {
        return res.json(product);
      }

      ProductCategoryModel.find({
        _id: {
          $in: product.categoryIds
        }
      }, function(err, categories) {
        let item = product.toJSON();
        if (!err) {
          item.categories = categories;
        }
        res.json(item);
      });
    })
    .catch(err => next(err));
  }

  /**
   * Update Product
   */
  static update(req, res, next) {
    ProductValidator.validateUpdating(req.body).then(data => {
      ProductBusiness.findOne({_id: req.params.id}).then(product => {
        var mongoose = require('mongoose');
        var performerId = mongoose.Types.ObjectId(req.body.performer);
        product.name = req.body.name;
        product.description = req.body.description;
        product.sort = req.body.sort;
        product.price = req.body.price;
        product.quantity = req.body.quantity;
        product.status = req.body.status;
        product.imageType = config.imageType;
        product.categoryIds = req.body.categoryIds;
        product.allowApplyCoupon = req.body.allowApplyCoupon;
        if (typeof req.files.file != 'undefined') {
          let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
          Func(req.files.file, req.user._id, function(err, result) {
            if (err) {
              return res.status(400).send(err);
            }

            _.merge(product, result);
            ProductBusiness.update(product)
              .then((product) => res.status(200).json(product))
          });
        } else {
          ProductBusiness.update(product)
            .then((product) => res.status(200).json(product));
        }
      });
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)))
  }


  /**
   * Deletes a Product
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.product = req.product;
    }
    ProductBusiness.findOne(condition).then(
      product => {
        if(!product) {
          return res.status(404,'Not found').end();
        }
        ProductBusiness.removeById(product._id)
        .then(function() {
          res.status(200,true).end();
        });
      },
      err => handleError(res)
    );
  }

  static countAllProducts(req, res) {
    let query = {
      status: 'active'
    };
    if (req.query.categoryId) {
      query.categoryIds = {
        $in: [req.query.categoryId]
      };
    }
    ProductModel.count(query, function(err, count) {
      res.status(200).send({ count: count || 0 });
    });
  }

  static search(req, res) {
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 12;
    let query = {};

    if (req.query.performerId) {
      query.performerId = req.query.performerId;
    }

    if (req.query.categoryId) {
      query.categoryIds = {
        $in: [req.query.categoryId]
      };
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    async.parallel({
      items(cb) {
        ProductModel.find(query)
          .sort({createdAt: -1})
          .skip(page * take)
          .limit(take)
          .exec(cb);
      },
      count(cb) {
        ProductModel.count(query, cb);
      }
    }, function(err, result) {
      if (err) {
        return res.status(500).send(err);
      }

      res.status(200).send(result);
    });
  }
}

module.exports = ProductController;
