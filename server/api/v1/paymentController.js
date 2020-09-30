'use strict';

import async from 'async';
import {
  UserSubscriptionModel, UserModel, SettingModel, PerformerModel, TransactionModel, EarningModel, ProductModel, CouponModel, OrderModel,
  VideoModel
} from '../../models';
import { Mailer } from '../../components';
import { PaymentBusiness } from '../../businesses';
import moment from 'moment';
import _ from 'lodash';
import md5 from 'md5';
import config from '../../config/environment';

function performerSubscription(req, cb) {
  let subscriptionField = req.body.subscriptionType === 'monthly' ? 'formMonthSubscription' : 'formYearlySubscription';
  async.auto({
    setting(cb) {
      SettingModel.findOne({}, cb);
    },
    performer(cb) {
      PerformerModel.findOne({
        _id: req.body.performerId
      }, cb);
    }
  }, function(err, data) {
    if (err || !data.setting || !data.setting.saltSubscriptions || !data.performer || !data.performer.ccbill[subscriptionField]) {
      return cb({
        msg: 'Not config ccbill yet'
      });
    }

    let flexForm = req.body.subscriptionType === 'monthly' ? data.performer.ccbill[subscriptionField] : data.performer.ccbill.formSinglePayment;
    let clientSubacc = data.performer.ccbill.subAccountSubscription;
    //https://kb.ccbill.com/Webhooks+User+Guide#Appendix_A:_Currency_Codes
    let currencyCode = '840'; //usd
    let salt = data.setting.saltSubscriptions;
    let initialPeriod = req.body.subscriptionType === 'monthly' ? 30 : 365;
    let initialPrice = (req.body.subscriptionType === 'monthly' ? data.performer.subscriptionMonthlyPrice : data.performer.subscriptionYearlyPrice).toFixed(2);
    if (!initialPrice) {
      return cb({ msg: 'Invalid price'})
    }
    /**
    https://kb.ccbill.com/Dynamic+Pricing
    For recurring transactions, use the following values in the order they are listed:
    initialPrice
    initialPeriod
    recurringPrice
    recurringPeriod
    numRebills
    currencyCode
    salt
    */
    let formDigest = req.body.subscriptionType === 'monthly' ? md5(
      initialPrice + initialPeriod + initialPrice + initialPeriod + '99' + currencyCode + salt
    ) : md5(
      initialPrice + initialPeriod + currencyCode + salt
    );
    let description = (req.body.subscriptionType === 'monthly' ? 'Monthly' : 'Yearly') + ' subscription ' + data.performer.username;
    //create transaction for future use
    let transaction = new TransactionModel({
      type: 'performer_subscription',
      price: initialPrice,
      description: description,
      performerId:data.performer._id,
      subscriptionType: req.body.type,
      userId: req.user._id,
      user: req.user._id,
      provider: 'ccbill',
      status: 'pending',
      products: [{
        price: initialPrice,
        quantity: 1,
        description: description,
        name: data.performer.username,
        _id: data.performer._id
      }]
    });

    transaction.save(function(err, saved) {
      if (err) {
        return cb(err);
      }

      let url = `https://api.ccbill.com/wap-frontflex/flexforms/${flexForm}?type=performer_subscription&transactionId=${saved._id}&userId=${req.user._id}&subscriptionType=${req.body.subscriptionType}&performerId=${req.body.performerId}&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&recurringPrice=${initialPrice}&recurringPeriod=${initialPeriod}&numRebills=99&clientSubacc=${clientSubacc}&currencyCode=${currencyCode}&formDigest=${formDigest}`
      cb(null, {
        redirectUrl: url
      });
    });
  });
}

function tipPerformer(req, cb) {
  async.auto({
    setting(cb) {
      SettingModel.findOne({}, cb);
    },
    performer(cb) {
      PerformerModel.findOne({
        _id: req.body.performerId
      }, cb);
    }
  }, function(err, data) {
    if (err || !data.setting || !data.setting.saltSingle || !data.performer) {
      return cb({
        msg: 'Not config ccbill yet'
      });
    }

    let flexForm = data.performer.ccbill.formSinglePayment;
    let clientSubacc = data.performer.ccbill.subAccountTip;
    //https://kb.ccbill.com/Webhooks+User+Guide#Appendix_A:_Currency_Codes
    let currencyCode = '840'; //usd
    let salt = data.setting.saltSingle;
    let initialPeriod = 30;
    let initialPrice = (req.body.formPrice || req.body.price || 10).toFixed(2);
    let formDigest = md5(
      initialPrice + initialPeriod + currencyCode + salt
    );
    let description = 'Tip ' + data.performer.username;
    //create transaction for future use
    let transaction = new TransactionModel({
      type: 'tip_performer',
      price: initialPrice,
      description: description,
      performerId:data.performer._id,
      userId: req.user._id,
      user: req.user._id,
      provider: 'ccbill',
      status: 'pending',
      products: [{
        price: initialPrice,
        quantity: 1,
        description: description,
        name: data.performer.username,
        _id: data.performer._id
      }]
    });

    transaction.save(function(err, saved) {
      if (err) {
        return cb(err);
      }

      let url = `https://api.ccbill.com/wap-frontflex/flexforms/${flexForm}?type=tip_performer&transactionId=${saved._id}&userId=${req.user._id}&performerId=${req.body.performerId}&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&clientSubacc=${clientSubacc}&currencyCode=${currencyCode}&formDigest=${formDigest}`;
      cb(null, {
        redirectUrl: url
      });
    });
  });
}

function buyProduct(req, cb) {
  async.auto({
    setting(cb) {
      SettingModel.findOne({}, cb);
    },
    products(cb) {
      let productIds = _.map(req.body.products, p => p.productId);
      ProductModel.find({
        _id: {
          $in: productIds
        }
      }, cb);
    },
    performer: ['products', function(result, cb) {
      if (!result.products.length) {
        return cb();
      }

      PerformerModel.findOne({
        _id: result.products[0].user
      }, cb);
    }]
  }, function(err, data) {
    if (err || !data.setting || !data.setting.saltSingle || !data.products || !data.products.length || !data.performer) {
      return cb({
        msg: 'Not config ccbill yet'
      });
    }

    let flexForm = data.performer.ccbill.formSinglePayment;
    let clientSubacc = data.performer.ccbill.subAccountStore;
    //https://kb.ccbill.com/Webhooks+User+Guide#Appendix_A:_Currency_Codes
    let currencyCode = '840'; //usd
    let salt = data.setting.saltSingle;
    let initialPeriod = 30;
    let initialPrice = 0;
    let storeProducts = [];
    data.products.forEach(p => {
      let q = _.find(req.body.products, o => o.productId === p._id.toString());
      let quantity = q ? q.quantity : 1;
      initialPrice += quantity * p.price;
      storeProducts.push({
        price: quantity * p.price,
        quantity: quantity,
        description: p.name,
        name: p.name,
        _id: p._id,
        performerId: data.performer.user
      });
    });
    initialPrice = initialPrice.toFixed(2);
    let formDigest = md5(
      initialPrice + initialPeriod + currencyCode + salt
    );
    //create transaction for future use
    let transaction = new TransactionModel({
      type: 'Store',
      price: initialPrice,
      description: (_.map(storeProducts, p => p.name)).join(', '),
      performerId: data.performer._id,
      userId: req.user._id,
      user: req.user._id,
      provider: 'ccbill',
      status: 'pending',
      products: storeProducts
    });

    transaction.save(function(err, saved) {
      if (err) {
        return cb(err);
      }

      let url = `https://api.ccbill.com/wap-frontflex/flexforms/${flexForm}?type=product&transactionId=${saved._id}&userId=${req.user._id}&performerId=${data.performer._id}&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&clientSubacc=${clientSubacc}&currencyCode=${currencyCode}&formDigest=${formDigest}`;
      cb(null, {
        redirectUrl: url
      });
    });
  });
}

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
          coupon: transaction.coupon,
          transactionId: transaction._id
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

function buySaleVideo(req, cb) {
  async.auto({
    setting(cb) {
      SettingModel.findOne({}, cb);
    },
    video(cb) {
      VideoModel.findOne({
        _id: req.body.videoId
      }, cb);
    },
    performer: ['video', function(result, cb) {
      PerformerModel.findOne({
        $or: [{
          _id: result.video.user
        }, {
          _id: result.video.performer[0]
        }]
      }, cb);
    }]
  }, function(err, data) {
    if (err || !data.setting || !data.setting.saltSingle || !data.video || !data.performer) {
      return cb({
        msg: 'Not config ccbill yet'
      });
    }

    let flexForm = data.performer.ccbill.formSinglePayment;
    let clientSubacc = data.performer.ccbill.subAccountSaleVideo;
    //https://kb.ccbill.com/Webhooks+User+Guide#Appendix_A:_Currency_Codes
    let currencyCode = '840'; //usd
    let salt = data.setting.saltSingle;
    let initialPeriod = 30;
    let price = (data.video.price * (req.body.quantity || 1)).toFixed(2);
    let formDigest = md5(
      price + initialPeriod + currencyCode + salt
    );
    let description = data.video.name;
    //create transaction for future use
    let transaction = new TransactionModel({
      type: 'sale_video',
      price: price,
      description: description,
      performerId:data.performer._id,
      userId: req.user._id,
      user: req.user._id,
      provider: 'ccbill',
      status: 'pending',
      products: [{
        price: price,
        quantity: 1,
        description: data.video.name,
        name: data.video.name,
        _id: data.video._id,
        performerId: data.video.user
      }]
    });

    transaction.save(function(err, saved) {
      if (err) {
        return cb(err);
      }

      let url = `https://api.ccbill.com/wap-frontflex/flexforms/${flexForm}?type=sale_video&transactionId=${saved._id}&userId=${req.user._id}&videoId=${req.body.videoId}&initialPrice=${price}&initialPeriod=${initialPeriod}&clientSubacc=${clientSubacc}&currencyCode=${currencyCode}&formDigest=${formDigest}`;
      cb(null, {
        redirectUrl: url
      });
    });
  });
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
    transactionId: transaction._id,
    status: 'active',
    videoId: transaction.products[0]._id
  });
  order.save((newOrder) => {
    EarningModel.addProduct({
      userId: transaction.user,
      performerId: transaction.performerId,
      order: newOrder.toObject()
    }, () => cb);
  });
}

exports.subscribeCCBill = function(req, res) {
  let Func;
  if (req.body.type === 'performer_subscription') {
    Func = performerSubscription;
  } else if (req.body.type === 'tip_performer') {
    Func = tipPerformer;
  } else if (req.body.type === 'product') {
    Func = buyProduct;
  } else if (req.body.type === 'sale_video') {
    Func = buySaleVideo;
  }
  if (!Func) {
    return res.status(400).send('Invalid request!');
  }

  Func(req, function(err, data) {
    if (err) {
      return res.status(400).send(err);
    }

    res.status(200).send(data);
  })
};

exports.doCCBillCallhook = function(req, res) {
  var userId = req.body['X-userId'] || req.body.userId;
  var type = req.body['X-type'] || req.body.type;
  var packageId = req.body['X-packageId'] || req.body.packageId;
  var subscriptionType = req.body['X-subscriptionType'] || req.body.subscriptionType || packageId;
  var subscriptionId = req.body['X-subscriptionId'] || req.body.subscription_id || req.body.subscriptionId;
  var performerId = req.body['X-performerId'] || req.body.performerId;
  var transactionId = req.body['X-transactionId'] || req.body.transactionId;
  if (!subscriptionId || !transactionId || ['Cancellation', 'RenewalFailure', 'NewSaleFailure'].indexOf(req.query.eventType) > -1) {
    return res.status(200).send({
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
      result.transaction.paymentInformation = req.body;
      result.transaction.save(cb);
    }]
  }, function(err, data) {
    if (!data.transaction) {
      data.transaction = data.subscription;
    }
    if (err || !data.transaction) {
      return res.status(200).send({
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
        subscriptionType: subscriptionType || 'monthly',
        transaction: data.transaction.toObject()
      }, function(err) {
        res.status(200).send({
          ok: true
        });
      });
    } else if (type === 'tip_performer') {
      return EarningModel.addTip({
        userId: userId || data.transaction.userId || data.transaction.user,
        performerId: data.transaction.performerId,
        price: data.transaction.price
      }, function() {
        res.status(200).send({
          ok: true
        });
      });
    } else if (type === 'product') {
      return updateProductTransaction(data.transaction, function(err) {
        if (err) {
          return res.status(400).send(err);
        }
        res.status(200).send({
          ok: true
        });
      })
    } else if (type === 'sale_video') {
      return updateSaleVideo(data.transaction, function(err) {
        if (err) {
          return res.status(400).send(err);
        }
        res.status(200).send({
          ok: true
        });
      })
    } else {
      res.status(200).send({
        ok: true
      });
    }
  });
}
