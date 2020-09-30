'use strict';

import async from 'async';
import {
  UserSubscriptionModel, UserModel, SettingModel, PerformerModel, TransactionModel, EarningModel,
  ProductModel, CouponModel, OrderModel,
  VideoModel, RequestLog
} from '../models';
import { Mailer } from '../components';
import { PaymentBusiness } from '../businesses';
import moment from 'moment';
import _ from 'lodash';
import config from '../config/environment';


function updateProductTransaction(transaction, cb) {
  async.waterfall([
    function(callback) {
      UserModel.findOne({_id: transaction.user}, callback);
    },
    //payment for membership
    function(user, callback) {
      if (transaction.coupon) {
        CouponModel.update({_id: transaction.coupon._id}, {$inc: {used: 1}}, function(err, update) { });
      }

      async.eachSeries(transaction.products, function(product, cb) {
        var order = new OrderModel({
          user: user._id,
          description: product.name,
          type: 'Store',
          provider: transaction.provider,
          quantity: product.quantity,
          price: product.price,
          totalPrice: parseFloat(product.price) * product.quantity,
          paymentInformation: transaction.paymentInformation,
          name: user.name,
          email:user.email,
          status: 'active',
          coupon: transaction.coupon
        });

        //console.log(order)
        order.save(function(err, newOrder) {
          if (err) {
            return cb(err);
          }

          Mailer.sendMail('buy_product.html', user.email, Object.assign({
            subject: config.siteName + ' - Payment successfully'
          }, {
            template: 'buy_product.html',
            to: user.email,
            subject: config.siteName + ' - Payment successfully',
            user: user.toObject(),
            product: product
          }));

          ProductModel.findOneAndUpdate({
            _id: product._id
          }, { $inc: { quantity: -1 }}, function(err, p) {
            if (!p.performerId) {
              return cb();
            }

            PerformerModel.findOne({
              _id: p.performerId
            }, function(err, performer) {
              if (err || !performer || !performer.email) {
                return cb(cb);
              }

              Mailer.sendMail('notify_product_performer.html', performer.email, Object.assign({
                subject: 'New product order'
              }, {
                user: user.toObject(),
                product: p.toObject(),
                performer: performer.toObject(),
                order: newOrder.toObject()
              }));

              newOrder.performerId = p.performerId;
              newOrder.save(() => {
                EarningModel.addProduct({
                  user: user.toObject(),
                  product: p.toObject(),
                  performer: performer.toObject(),
                  order: newOrder.toObject()
                }, () => cb());
              });
            });
          });
        });
      }, callback);
    }
  ], cb);
}

function updateSaleVideo(transaction, cb) {
  var order = new OrderModel({
    user: transaction.user,
    description: transaction.description,
    type: 'sale_video',
    quantity: 1,
    price: transaction.price,
    totalPrice: transaction.price,
    paymentInformation: transaction.paymentInformation,
    status: 'active',
    videoId: transaction.products[0]._id
  });
  order.save(cb);
}

function doCCBillCallhook(reqBody, reqQuery, cb) {
  var userId = reqBody['X-userId'] || reqBody.userId;
  var type = reqBody['X-type'] || reqBody.type;
  var packageId = reqBody['X-packageId'] || reqBody.packageId;
  var subscriptionType = reqBody['X-subscriptionType'] || reqBody.subscriptionType || packageId;
  var subscriptionId = reqBody['X-subscriptionId'] || reqBody.subscription_id || reqBody.subscriptionId;
  var performerId = reqBody['X-performerId'] || reqBody.performerId;
  var transactionId = reqBody['X-transactionId'] || reqBody.transactionId;
  if (!subscriptionId || !transactionId || ['Cancellation', 'RenewalFailure', 'NewSaleFailure'].indexOf(reqQuery.eventType) > -1) {
    return cb(null, {
      ok: true
    });
  }

  //'NewSaleSuccess', 'RenewalSuccess' hook
  async.auto({
    transaction(cb) {
      var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
      if (!checkForHexRegExp.test(transactionId)) {
        return cb();
      }
      TransactionModel.findOne({
        _id: transactionId
      })
      .sort({ createdAt: -1 })
      .exec(cb);
    },
    subscription: ['transaction', function(result, cb) {
      if (result.transaction) {
        return cb(null, result.transaction);
      }

      TransactionModel.findOne({
        $or: [{
          'paymentInformation.subscriptionId': subscriptionId
        }, {
          'paymentInformation.subscription_id': subscriptionId
        }]
      })
      .sort({ createdAt: -1 })
      .exec(cb);
    }],
    updatedTransaction: ['subscription', function(result, cb) {
      if (!result.transaction) {
        result.transaction = result.subscription;
      }
      if (!result.transaction) {
        return cb();
      }

      if (result.transaction.status === 'completed') {
        return cb(null, result.transaction);
      }

      result.transaction.status = 'completed';
      result.transaction.paymentInformation = reqBody;
      result.transaction.save(cb);
    }]
  }, function(err, data) {
    if (!data.transaction) {
      data.transaction = data.subscription;
    }
    if (err || !data.transaction) {
      return cb(null, {
        ok: false
      });
    }

    if (['performer_subscription', 'tip_performer', 'product', 'sale_video'].indexOf(type) === -1) {
      type = data.transaction.type;
    }
    if (['yearly', 'monthly'].indexOf(subscriptionType)) {
      subscriptionType = 'monthly';
    }

    if (type === 'performer_subscription') {
      return UserSubscriptionModel.updateUserSubscription({
        userId: userId || data.transaction.userId || data.transaction.user,
        performerId: performerId || data.transaction.performerId,
        subscriptionType: subscriptionType || 'monthly'
      }, function(err) {
        cb(null, {
          ok: true
        });
      });
    } else if (type === 'tip_performer') {
      return EarningModel.addTip({
        userId: userId || data.transaction.userId || data.transaction.user,
        performerId: data.transaction.performerId,
        price: data.transaction.price
      }, function() {
        cb(null, {
          ok: true
        });
      });
    } else if (type === 'product') {
      return updateProductTransaction(data.transaction, function(err) {
        if (err) {
          return res.status(400).send(err);
        }
        cb(null, {
          ok: true
        });
      })
    } else if (type === 'sale_video') {
      return updateSaleVideo(data.transaction, function(err) {
        if (err) {
          return res.status(400).send(err);
        }
        cb(null, {
          ok: true
        });
      })
    } else {
      cb(null, {
        ok: true
      });
    }
  });
}

function updateRenewal(logs, cb) {
  async.eachSeries(logs, function(log, cb) {
    let subscriptionId = log.reqBody.subscriptionId || log.reqBody.subscription_id;
    if (!subscriptionId) {
      console.error('No subscription id ', subscriptionId);
      return cb();
    }

    // this request does not include transaction id, so we must retry in the DB for that
    // then call to update hook if it is not complete
    TransactionModel.findOne({
      $or: [{
        'paymentInformation.subscriptionId': subscriptionId
      }, {
        'paymentInformation.subscription_id': subscriptionId
      }]
    })
    .sort({ createdAt: -1 })
    .exec(function(err, transaction) {
      if (err) {
        console.log('Transaction error for ', subscriptionId, err);
        return cb();
      }
      if (!transaction) {
        console.log('Transaction not found for ', subscriptionId);
        return cb();
      }
      if (transaction.type !== 'performer_subscription') {
        console.log('Invalid performer_subscription type', subscriptionId, transaction._id);
        return cb();
      }
      UserSubscriptionModel.findOne({
        userId: transaction.userId || transaction.user,
        performerId: transaction.performerId
      }, function(err, subscription) {
        if (err) {
          console.log('Find subscription error', err);
          return cb();
        }

        if (subscription && moment(subscription.expiredDate).isAfter(moment().add(5, 'days'))) {
          console.log('Subscription success before', subscriptionId);
          return cb();
        }
        doCCBillCallhook(log.reqBody, log.query, function(err, data) {
          if (err) {
            console.log(err);
            return cb();
          }

          if (!data.ok) {
            console.log('Do update but not success', subscriptionId);
          } else {
            console.log('Do update success', subscriptionId);
          }

          cb();
        });
      });
    });
  }, cb);
}

function updateSubscription(logs, cb) {
  async.eachSeries(logs, function(log, cb) {
    let transactionId = log.reqBody['X-transactionId'] || log.reqBody.transactionId;
    if (!transactionId) {
      console.error('No transaction id ', transactionId, log._id);
      return cb();
    }

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    if (!checkForHexRegExp.test(transactionId)) {
      console.error('Invalid transaction id ', transactionId);
      return cb();
    }

    // this request does not include transaction id, so we must retry in the DB for that
    // then call to update hook if it is not complete
    TransactionModel.findOne({
      _id: transactionId
    }, function(err, transaction) {
      if (err) {
        console.log('Transaction error for ', transactionId, err);
        return cb();
      }
      if (!transaction) {
        console.log('Transaction not found for ', transactionId);
        return cb();
      }
      if (transaction.type === 'performer_subscription') {
        UserSubscriptionModel.findOne({
          userId: transaction.userId || transaction.user,
          performerId: transaction.performerId
        }, function(err, subscription) {
          if (err) {
            console.log('Find subscription error', err);
            return cb();
          }

          if (subscription && moment(subscription.expiredDate).isAfter(moment().add(5, 'days'))) {
            console.log('Subscription success before', transactionId);
            return cb();
          }
          doCCBillCallhook(log.reqBody, log.query, function(err, data) {
            if (err) {
              console.log(err);
              return cb();
            }

            if (!data.ok) {
              console.log('Do update but not success', transactionId);
            } else {
              console.log('Do update success', transactionId);
            }

            cb();
          });
        });
      } else if (transaction.type === 'sale_video') {
        OrderModel.count({
          user: transaction.userId || transaction.user,
          videoId: transaction.products[0]._id
        }, function(err, count) {
          if (count) {
            console.log('This sale video order is done before', transaction._id);
            return cb();
          }

          doCCBillCallhook(log.reqBody, log.query, function(err, data) {
            if (err) {
              console.log(err);
              return cb();
            }

            if (!data.ok) {
              console.log('Do update but not success', transactionId);
            } else {
              console.log('Do update success', transactionId);
            }

            cb();
          });
        });
      } else {
        console.log('not support this type', transaction.type, transaction._id);
        return cb();
      }
    });
  }, cb);
}

module.exports = function(cb) {
  async.waterfall([
    function(cb) {
      RequestLog.find({
        path: /.*RenewalSuccess.*/i
      }, function(err, logs) {
        if (err) {
          console.log('renewal error', err);
          cb(err);
        }
        updateRenewal(logs, function() {
          cb();
        });
      });
    },
    function(cb) {
      RequestLog.find({
        $or: [{
          path: '/api/v1/ccbill/hook'
        }, {
          path: /.*NewSaleSuccess.*/i
        }],
        createdAt: {
          $gte: moment().add(-30, 'days').toDate()
        }
      }, function(err, logs) {
        if (err) {
          console.log('subscription error', err);
          cb(err);
        }
        updateSubscription(logs, function() {
          cb();
        });
      });
    }
  ], cb);
};
