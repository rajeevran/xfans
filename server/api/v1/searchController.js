'use strict';

import { PerformerModel, VideoModel, ProductModel } from '../../models';
import async from 'async';

class SearchController {
  static stats(req, res) {
    let query = { status: 'active' };
    if (req.query.q) {
      query.$or = [{
        name: new RegExp(req.query.q.toLowerCase(), 'i')
      }, {
         //for movies and products
        categoriesInfo: {
          $elemMatch: {
            name: new RegExp(req.query.q.toLowerCase(), 'i')
          }
        }
      }, {
        tags: new RegExp('^' + req.query.q.toLowerCase(), 'i')
      }];
    }

    async.parallel({
      video(cb) {
        VideoModel.count(query, cb);
      },
      performer(cb) {
        PerformerModel.count(query, cb);
      },
      product(cb) {
        ProductModel.count(query, cb);
      }
    }, function(err, result) {
      if (err) {
        return res.status(500).send(err);
      }

      res.status(200).send(result);
    });
  }

  static findItems(req, res) {
    let type = req.query.type || 'video';
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 10;
    let query = {
      status: 'active'
    };
    let model;
    switch (type) {
      case 'product':
        model = ProductModel;
        break;
      case 'performer':
        model = PerformerModel;
        break;
      default:
        model = VideoModel;
        break;
    }

    if (req.query.performerId && type === 'video') {
      query.performer = {
        $in: [req.query.performerId]
      };
    }

    if (req.query.performerId && type === 'product') {
      query.performerId = {
        $in: [req.query.performerId]
      };
    }

    if (req.query.q) {
      query.$or = [{
        name: new RegExp(req.query.q.toLowerCase(), 'i')
      }, {
         //for movies and products
        categoriesInfo: {
          $elemMatch: {
            name: new RegExp(req.query.q.toLowerCase(), 'i')
          }
        }
      }, {
        tags: new RegExp('^' + req.query.q.toLowerCase(), 'i')
      }];
    }

    if (req.query.categoryId && type === 'video') {
      query.categories = {
        $in: [req.query.categoryId]
      };
    }

    if (req.query.categoryId && type === 'product') {
      query.categoryIds = {
        $in: [req.query.categoryId]
      };
    }

    if (type === 'performer') {
      if (req.query.sex) {
        query.sex = req.query.sex;
      }
      if (req.query.size) {
        query.bust = new RegExp(req.query.size, 'i');
      }
    }

    //TODO - check category and more options here
    async.parallel({
      count(cb) {
        model.count(query, cb);
      },
      items(cb) {
        model.find(query)
        .sort({ createdAt: -1 })
        .skip(page * take)
        .limit(take)
        .exec(cb);
      }
    }, function(err, result) {
      if (err) {
        return res.status(500).send(err);
      }

      res.status(200).send(result);
    });
  }
}

module.exports = SearchController;
