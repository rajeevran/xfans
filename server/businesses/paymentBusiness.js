'use strict';
import async from 'async';
import {
  ProductModel,
  MemberShipPackageModel,
  TransactionModel,
  UserModel,
  UserTempModel,
  OrderModel,
  CouponModel,
  PerformerModel,
  UserSubscriptionModel,
  EarningModel,
  VideoModel
} from '../models';
import { Mailer } from '../components';
import config from '../config/environment';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import _ from 'lodash';

class PaymentBusiness {

  /**
   * check payment type onetime/recurring
   * @param  {Object} body Page data
   * @return {Promise}
   */
  static getPaymentInfo(body) {
    return new Promise((resolve, reject) => {
      if (body.type === 'sale_video') {
        //specicl content for subscription
        VideoModel.findOne({
          _id: body.videoId
        }, function(err, video) {
          if (err || !video) {
            return reject('Video not found!');
          }

          let paymentInfo = {
            price: video.price,
            description: 'Sale for video ' + video.name,
            type: 'sale_video',
            videoId: video._id,
            performerId: video.performer[0] || video.user,
            products: [{
              _id: video._id,
              name: video.name,
              description: 'Sale for video ' + video.name,
              quantity: 1,
              price: video.price,
              performerId: video.performer[0] || video.user
            }]
          };
          resolve(paymentInfo);
        });
      } else if (body.type === 'performer_subscription') {
        //specicl content for subscription
        PerformerModel.findOne({
          _id: body.performerId
        }, function(err, performer) {
          if (err || !performer) {
            return reject('Performer not found!');
          }

          let subscriptionType = body.subscriptionType;
          let price = subscriptionType === 'monthly' ? performer.subscriptionMonthlyPrice : performer.subscriptionYearlyPrice;
          let paymentInfo = {
            price,
            description: (subscriptionType === 'monthly' ? 'Monthly' : 'Yearly') + ' subscription ' + performer.name,
            type: 'performer_subscription',
            performerId: performer._id,
            subscriptionType,
            products: [{
              _id: performer._id,
              name: performer.name,
              description: (subscriptionType === 'monthly' ? 'Monthly' : 'Yearly') + ' subscription',
              quantity: 1,
              price
            }]
          };
          resolve(paymentInfo);
        });
      } else if (body.type === 'tip_performer') {
        if (body.formPrice < 0) {
          return reject('Wrong price!');
        }

        //specicl content for subscription
        PerformerModel.findOne({
          _id: body.performerId
        }, function(err, performer) {
          if (err || !performer) {
            return reject('Performer not found!');
          }

          let price = body.formPrice;
          let paymentInfo = {
            price,
            description: 'Tip to ' + performer.name,
            type: 'tip_performer',
            performerId: performer._id,
            products: [{
              _id: performer._id,
              name: 'Tip',
              description: 'Tip to ' + performer.name,
              quantity: 1,
              price
            }]
          };
          resolve(paymentInfo);
        });
      } else if(body.package){
        MemberShipPackageModel.findOne({_id: body.package}).exec()
          .then(data=>{
            if(!data){
              return reject('Package not found');
            }
            let paymentInfo = {
              price: data.price,
              description: data.name,
              type: 'Membership Plan',
              products: [{
                _id: data._id,
                name: data.name,
                description: data.description,
                quantity: 1,
                price: data.price
              }]
            };
            resolve(paymentInfo);
          })
          .catch(() => {
            reject('Package not found');
          });
      }else{
        async.waterfall([
          (callback)=>{
            if(body.coupon && body.coupon.code){
              CouponModel.findOne({ code: body.coupon.code, isActive: true }, function(err, coupon) {
                if (err || !coupon) {
                  return callback(null, null);
                }
                if(coupon.useMultipleTimes){
                  callback(null, coupon);
                }else{
                  OrderModel.find({'coupon.code': coupon.code}, function(err, data){
                    if(err || data.length){
                      return callback(null, null);
                    }
                    callback(null, coupon);
                  });
                }
              });
            }else{
              callback(null, null);
            }
          },
          (coupon, callback)=>{
            ProductModel.find({_id:{$in: Object.keys(body.products)}}).exec()
              .then(products=>{
                if(!products.length){
                  return callback('Product not found');
                }
                let paymentInfo = {
                  price: 0,
                  description: 'Pay products',
                  type: 'Store',
                  products: []
                };
                products.forEach(prod =>{
                  let qty = parseInt(body.products[prod._id.toString()]) || 1;
                  paymentInfo.price += prod.price * qty;
                  paymentInfo.products.push({
                    _id: prod._id,
                    name: prod.name,
                    description: prod.description,
                    quantity: qty,
                    price: prod.price
                  });
                });
                if(coupon){
                  paymentInfo.coupon = coupon;
                }
                callback(null, paymentInfo);
              })
              .catch(() => {
                callback('Product not found');
              });
          }
        ], (err, result)=>{
          if(err){
            return reject(err);
          }
          resolve(result);
        });
      }
    });
  }

  static createTransaction(data){
    return TransactionModel.create(data);
  }

  static updateTransaction(paymentRes){
    return new Promise((resolve, reject) => {
      TransactionModel.findById(paymentRes.transactionId, (err, transaction)=>{
        if(err || !transaction){
          //return error if payment completed
          if(paymentRes.status === 'completed'){
            return reject(err);
          }
          return resolve({});
        }
        //update transaction
        transaction.status = paymentRes.status;
        transaction.paymentInformation = paymentRes;
        transaction.save();
        if(transaction.status === 'completed'){
          if (transaction.type === 'performer_subscription') {
            //Do update for subscription package of user
            UserSubscriptionModel.updateUserSubscription({
              userId: transaction.user,
              performerId: transaction.performerId,
              subscriptionType: transaction.subscriptionType
            }, function(err) {
              if (err) {
                return reject(err);
              }

              resolve(transaction);
            });
          } else if (transaction.type === 'tip_performer') {
            //Do update for subscription package of user
            EarningModel.addTip({
              userId: transaction.user,
              performerId: transaction.performerId,
              price: transaction.price
            }, function(err) {
              if (err) {
                return reject(err);
              }

              UserModel.findOne({
                _id: transaction.user
              }, function(errr, user) {
                if (errr) {
                  return reject(errr);
                }
                var order = new OrderModel({
                  user: transaction.user,
                  email: user.email,
                  name: user.name,
                  description: transaction.description,
                  type: 'tip_performer',
                  quantity: 1,
                  price: transaction.price,
                  totalPrice: transaction.price,
                  paymentInformation: null,
                  status: 'active',
                  performerId: transaction.performerId || transaction.products[0]._id
                });
                order.save(function (err, order) {
                  EarningModel.addTip({
                    userId: transaction.user,
                    performerId: transaction.performerId,
                    price: transaction.price
                  }, function (err) {
                    if (err) {
                      return reject(err);
                    }
                    resolve(transaction);
                  });
                });
              })
            })
          } else if (transaction.type === 'Membership Plan') {
            let isNewUser = false;
            async.waterfall([
              //get user
              callback => {
                if(transaction.userId){
                  UserTempModel.findById(transaction.userId).then(userTemp =>{
                    UserModel.findOne({email: userTemp.email}).exec()
                      .then(user=>{
                        if(user){
                          return callback(null, user);
                        }
                        UserModel.create({
                          name: userTemp.name,
                          email: userTemp.email,
                          imageThumbPath: '/uploads/default.jpg',
                          imageMediumPath: '/uploads/default.jpg',
                          password: userTemp.password,
                          status: 'active',
                          subscriptionId: paymentRes ? paymentRes.id || paymentRes.TOKEN : ''
                        }).then(user=>{
                          transaction.user = user._id;
                          transaction.save();
                          isNewUser = true;
                          callback(null, user);
                        }).catch(err => {
                          return callback(err);
                        });
                      });
                  }).catch(err=>{
                    return callback('User Temp not found');
                  });
                }else{
                  UserModel.findById(transaction.user).then(user=>{
                    if(!user){
                      return callback('User not found');
                    }
                    callback(null, user);
                  }).catch(err=>{
                    return callback('User not found');
                  });
                }
              },
              //payment for membership
              (user, callback) => {
                MemberShipPackageModel.findOne({_id: transaction.products[0]._id}).exec()
                  .then(memberShipPackage=>{
                    if(!memberShipPackage){
                      return callback('Member ship package not found');
                    }
                    let dateExpire = moment();
                    if(user.dateExpire){
                      let date = moment(user.dateExpire);
                      if(date>dateExpire){
                        dateExpire = date;
                      }
                    }
                    dateExpire = moment(dateExpire).add(memberShipPackage.numberDay, 'days');
                    user.dateExpire = dateExpire;
                    user.isVip = true; //memberShipPackage.type === 'subscriptions';
                    user.isBuyProduct = true;
                    user.package = memberShipPackage._id;
                    user.subscriptionId = paymentRes ? paymentRes.id || paymentRes.TOKEN : '';
                    user.save();

                    OrderModel.create({
                      user: user._id,
                      description: memberShipPackage.name,
                      type: 'Membership Plan',
                      provider: transaction.provider,
                      expireDate: dateExpire,
                      totalPrice: memberShipPackage.price,
                      paymentInformation: transaction.paymentInformation,
                      name: user.name,
                      email: user.email,
                      status: 'active'
                    })
                      .then(function() {
                        let send = {
                          template: 'update_vip.html',
                          to: user.email,
                          subject: 'Update Vip ' + config.siteName,
                          user: user
                        };
                        if(isNewUser){
                          send.template = 'welcome.html';
                          send.subject = 'Welcome to ' + config.siteName;
                        }

                        Mailer.sendMail(send.template, send.to, Object.assign({subject: send.subject}, send));
                        callback();
                      })
                      .catch(err => {
                        callback('can\'t create order');
                      });
                  });
              }
            ],(err)=>{
              if(err){
                return reject(err);
              }
              let data={};
              if(isNewUser){
                data.type = 'signup';
              }else{
                data.type = transaction.type;
              }
              return resolve(data);
            });
          } else if (transaction.type === 'sale_video') {
            EarningModel.count({
              transactionId: transaction._id
            }, function (e, count) {
              if (!e && count) {
                return reject({
                  message: 'Duplicate transaction!'
                })
              }
              UserModel.findOne({
                _id: transaction.user
              }, function(errr, user) {
                if (errr) {
                  return reject(errr);
                }
                var order = new OrderModel({
                  user: transaction.user,
                  email: user.email,
                  name: user.name,
                  description: transaction.description,
                  type: 'sale_video',
                  quantity: 1,
                  price: transaction.price,
                  totalPrice: transaction.price,
                  paymentInformation: null,
                  status: 'active',
                  videoId: transaction.products[0]._id,
                  performerId: transaction.performerId || transaction.products[0].performerId
                });
                order.save(function (err, order) {
                  EarningModel.addSaleVideo({
                    userId: transaction.user,
                    performerId: transaction.performerId,
                    order: order
                  }, function (err) {
                    if (err) {
                      return reject(err);
                    }
                    resolve(transaction);
                  });
                });
              })

            })
          } else {
            async.waterfall([
              //get user
              callback => {
                  UserModel.findById(transaction.user).then(user=>{
                    if(!user){
                      return callback('User not found');
                    }
                    callback(null, user);
                  }).catch(err=>{
                    return callback('User not found');
                  });
              },
              //payment for membership
              (user, callback) => {
                if(transaction.coupon) {
                  CouponModel.update({_id: transaction.coupon._id}, {$inc: {used: 1}}, (err, update)=> {
                    console.log(err, update);
                  });
                }
                async.each(transaction.products, (product, cb) => {
                  var order = {
                    user: user._id,
                    description: product.name,
                    type: 'Store',
                    provider: transaction.provider,
                    quantity: product.quantity,
                    price: product.price,
                    totalPrice: product.price * product.quantity,
                    paymentInformation: transaction.paymentInformation,
                    name: user.name,
                    email:user.email,
                    status: 'active'
                  };
                  if(transaction.coupon){
                    order.coupon = transaction.coupon;
                  }
                  //console.log(order)
                  OrderModel.create(order)
                    .then(function(newOrder) {
                      var send = {
                        template: 'buy_product.html',
                        to: user.email,
                        subject: config.siteName + ' - Payment successfully',
                        user: user,
                        product:product
                      };
                      //email to buyer
                      Mailer.sendMail(send.template, send.to, Object.assign({subject: send.subject}, send));
                      //notify to performer

                      ProductModel.findOneAndUpdate({
                        _id: product._id
                      }, { $inc: { quantity: -1 }}, (err, p) => {
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
                    })
                    .catch(err => {
                      callback('can\'t create order');
                    });
                }, err => {
                  callback(err);
                });
              }
            ],(err)=>{
              if(err){
                return reject(err);
              }
              let data={type: transaction.type};
              return resolve(data);
            });
          }
        }else{
          resolve({});
        }
      });
    });
  }
}

module.exports = PaymentBusiness;
