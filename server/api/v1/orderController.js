'use strict';

import { OrderModel, UserModel } from '../../models';
import { OrderBusiness } from '../../businesses';
import { OrderValidator, parseJoiError } from '../../validators';
import config from '../../config/environment';
import _ from 'lodash';
import async from 'async';

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

class OrderController {
  /**
   * Get list of Orders
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
			req.query.limit = parseInt(req.query.limit);
		}
		if(req.query.offset!='undefined'){
			req.query.offset = parseInt(req.query.offset);
		}
    return OrderBusiness.find(req.query,req.user)
      .then(orders => {
        res.status(200).json(orders);
      })
      .catch(handleError(res));
  }

  static search(req, res) {
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 12;
    let query = {};

    if (req.user.role !== 'admin' && req.query.user) {
      query.user = req.user._id
    }else if (req.user.role === 'admin' && req.query.user){
      query.user = req.query.user
    }

    if (req.query.keyword) {
      var regex = new RegExp(req.query.keyword, "i")
      query = { $or :[{name : regex},{address : regex},{email : regex},{description : regex}]};
    }

    if (req.query.performerId) {
      query.performerId = req.query.performerId
    }

    if (req.query.type) {
      query.type = req.query.type
    }

    async.auto({
      count(cb) {
        OrderModel.count(query, cb)
      },
      items(cb) {
        OrderModel.find(query)
        .limit(take)
        .skip(take * page)
        .sort('-createdAt')
        .exec(cb)
      },
      users: ['items', (result, cb) => {
        if (!result.items.length) {
          return cb(null)
        }
        const userIds = result.items.map(item => item.user);
        UserModel.find({_id: { $in: userIds}}, cb)
      }]
    }, function(err, result) {
      if (err) {
        return res.status(500).send(err)
      }
      res.status(200).send({
        count: result.count,
        items: result.items.map(item => {
          const data = item.toObject();
          data.userInfo = _.find(result.users, user => user._id.toString() === data.user.toString());
          data.userInfo = _.pick(data.userInfo, ['name', 'email', '_id'])
          return data
        })
      })
    })
  }

  /**
   * Creates a new Order
   */
  static create(req, res, next) {
    OrderValidator.validateCreating(req.body).then(data => {

      OrderBusiness.create(data,req.user).then(function(order) {

        res.status(200).json(order);
      })
      .catch(err => {
        validationError(res, 422)(err);
      });
    })
    .catch(err => {
      validationError(res, 422)(parseJoiError(err));
    });
  }

  /**
   * Creates a new Order by Admin
   */
  static adminCreate(req, res, next) {
    OrderValidator.validateCreating(req.body).then(data => {
        let item = new OrderModel(data)
        item.save((err, result) => res.status(err ? 500 : 200).send(result));
      })
      .catch(err => {
        validationError(res, 422)(err);
      });
  }

  /**
   * Get a single Order
   */
  static show(req, res, next) {
    OrderBusiness.findOne({_id: req.params.id})
    .then(order => {
      if (!order) {
        return res.status(404).end();
      }
      res.json(order);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single Order
   */
  static update(req, res, next) {
    OrderValidator.validateUpdating(req.body).then(data => {
      OrderBusiness.findOne({_id: req.params.id}).then(order => {

        if(!order) {
          return validationError(res, 404)({message: 'Not found'});
        }
        if(data._id) {
          delete data._id;
        }
        order = _.merge(order, data);
        OrderBusiness.update(order).then(function(order) {
            return res.status(200).json(order);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });
      });

  }

  /**
   * Deletes a Order
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    OrderBusiness.findOne(condition).then(
      order => {
        if(!order) {
          return res.status(404,'Not found').end();
        }
        OrderBusiness.removeById(order._id)
        .then(function() {
          res.status(200,true).end();
        });
      },
      err => handleError(res)
    );
  }


  /**
   * Authentication callback
   */
  static authCallback(req, res, next) {
    res.redirect('/');
  }
}

module.exports = OrderController;
