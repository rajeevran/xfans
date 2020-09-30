'use strict';

import { GUserModel } from '../../../models';
import { GUserBusiness } from '../../../businesses';
import { S3, GM, Mailer, Uploader } from '../../../components';
import { GUserValidator, parseJoiError } from '../../../validators';
import Helper from '../../../helpers';
import config from '../../../config/environment';
import jwt from 'jsonwebtoken';
import async from 'async';
import stripe from 'stripe';
import _ from 'lodash';


  // Publishable key
  // pk_test_51HOzjrEOWZXUcja69ViXquQYaQwfvUbOBhSNMkWjwKxUR5wfFdzAYXRdhN9ddpvENBN1Qvkn2slDsZgAu10PCvT900oo50jBko
  // Secret key
  // sk_test_51HOzjrEOWZXUcja6qYJx2ftJ2cw0PHlLtaP7O4ZxtSoptHmn80ahN7uo4o0QhZfy6WRQtC4SL9aRx42dMJfBzRYh00BC1SK2T1

var Publishable_Key = 'pk_test_51HOzjrEOWZXUcja69ViXquQYaQwfvUbOBhSNMkWjwKxUR5wfFdzAYXRdhN9ddpvENBN1Qvkn2slDsZgAu10PCvT900oo50jBko'
var Secret_Key = 'sk_test_51HOzjrEOWZXUcja6qYJx2ftJ2cw0PHlLtaP7O4ZxtSoptHmn80ahN7uo4o0QhZfy6WRQtC4SL9aRx42dMJfBzRYh00BC1SK2T1'
  
var stripe = stripe(Secret_Key) 





var mailProperty = require('../../../modules/sendMail');

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


class GUserController {
  /**
   * Get list of users
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
			req.query.limit = parseInt(req.query.limit);
		}
		if(req.query.offset!='undefined'){
			req.query.offset = parseInt(req.query.offset);
		}
    return GUserBusiness.find(req.query)
      .then(users => {
        res.status(200).json(users);
      })
      .catch(handleError(res));
  }

  /**
   * Forgot password
   */
  static forgot(req, res) {
    var newPass = Math.floor(Math.random() * 1000000000);
    async.auto({
      user(cb) {
        GUserModel.findOne({
          email: req.body.email
        }, cb);
      }
    }, function(err, result) {
      if (err) {
        return res.status(400).send(err);
      }

      if (!result.user ) {
        return res.status(400).send({
          message: 'No account'
        });
      }

      var name, email;
      if (result.user) {
        GUserBusiness.forgotPassword({email:req.body.email}, newPass);
        email = result.user.email;
        name = result.user.name;
      }

      var send = {
        template: 'forgotPassword.html',
        to: email,
        subject: 'Forgot password ',
        user: {
          password: newPass,
          name: name
        }
      }

      mailProperty('forgotPasswordMail')(email, {
        name: name,
        email: email,
        new_password: newPass,
        site_url: config.liveUrl,
        date: new Date()
      }).send();

      //Mailer.sendMail(send.template, send.to, Object.assign({subject: send.subject}, send), (err) => { });
      res.json({
        ok: true
      });
    });
  }

  /**
   * Creates a new user
   */
  static create(req, res, next) {
    GUserValidator.validateCreating(req.body).then(user => {
      user.imageType = config.imageType;
      user.name = req.body.name;
      user.email = req.body.email;
      user.phone = req.body.phone;
      user.status = req.body.status;
      user.dateExpire = req.body.dateExpire;
      user.emailVerifiedToken = Helper.StringHelper.randomString(48);
      async.waterfall([
        function(cb) {
          if (!req.files.file) {
            return  cb();
          }

          user.imageType = config.imageType;
          // let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
          // Func(req.files.file, req.user._id, function(err, result) {
          //   user.photo  = result.imageFullPath;
          //   user.imageMediumPath  = result.imageMediumPath;
          //   user.imageThumbPath  = result.imageThumbPath;
          //   cb();
          // });
        }
      ], function() {
        GUserBusiness.create(user)
          .then((data) => {

                  
            mailProperty('emailVerificationMail')(data.email, {
              name: data.name,
              email: data.email,
              emailVerifyLink: config.liveUrl + `api/v1/users/verifyEmail/${data.emailVerifiedToken}`,
              site_url: config.liveUrl,
              date: new Date()
            }).send();
            
            // Mailer.sendMail('verify-email.html', data.email,
            // {
            //   subject: 'Verify email address',
            //   user: data.toObject(),
            //   emailVerifyLink: config.baseUrl + `api/v1/users/verifyEmail/${data.emailVerifiedToken}`,
            //   siteName: config.siteName
            // });

            res.status(200).json(data)
          })
          .catch(err => res.status(400).json(err));
      });
    })
    .catch(err => res.status(400).json(err));
  }

  static verifyEmail(req, res, next) {
    if (!req.params.token) {
      return res.status(404).send({
        message: 'Error verify token'
      })
    }
    GUserModel.findOne({
      emailVerifiedToken: req.params.token
    }, function(error, user) {
      if (error) {
        return res.status(500).send(error)
      }
      if (!user) {
        return res.status(404).send({
          message: 'User not found'
        })
      }
      if (user.emailVerified) {
        return res.redirect(config.baseUrl)
      }
      user.emailVerified = true;
      user.emailVerifiedToken = null;
      user.save().then((data) => {
        res.redirect(config.baseUrl + 'login')
      })
    })
  };

  // static verifyEmailView (req, res, next) {
  //     const user = await DB.User.findOne({
  //       emailVerifiedToken: req.params.token
  //     });

  //     if (user) {
  //       user.emailVerified = true;
  //       user.emailVerifiedToken = null;
  //       await user.save();
  //     }

  //     return res.render('auth/verify-email.html', {
  //       verified: user !== null,
  //       siteName: nconf.get('SITE_NAME')
  //     });
  // };

  /**
   * Get a single user
   */
  static show(req, res, next) {
    GUserBusiness.findOne({_id: req.params.id})
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
  }

  /**
   * Deletes a user
   * restriction: 'admin'
   */
  static destroy(req, res) {
    GUserBusiness.findOne({_id: req.params.id})
    .then(user => {
     
        return GUserBusiness.removeById(req.params.id)
            .then(function() {
              res.status(200,true).end();
            }).catch(handleError(res));
    
    })
    .catch(err => next(err));
  }

  /**
   * Check User Expire Date
   */
  static checkVip(req, res, nex){
    var date = new Date();
    GUserBusiness.find({"dateExpire": {"$lt": date}}).then(users => {
      for(var i =0; i < users.length; i++){
        users[i].isVip = false;
        users[i].isBuyProduct = false;
        users[i].save();
      }
    });
  }

  /**
   * Update Member Ship When purchased
   */
 

  /**
   * Update Member Ship When purchased
   */
  static payment(req, res, next) {
    //TODO - update validator
  // Publishable key
  // pk_test_51HOzjrEOWZXUcja69ViXquQYaQwfvUbOBhSNMkWjwKxUR5wfFdzAYXRdhN9ddpvENBN1Qvkn2slDsZgAu10PCvT900oo50jBko
  // Secret key
  // sk_test_51HOzjrEOWZXUcja6qYJx2ftJ2cw0PHlLtaP7O4ZxtSoptHmn80ahN7uo4o0QhZfy6WRQtC4SL9aRx42dMJfBzRYh00BC1SK2T1



  app.get('/', function(req, res){ 
    res.render('Home', { 
       key: Publishable_Key 
    }) 
}) 
  
app.post('/payment', function(req, res){ 
  
    // Moreover you can take more details from user 
    // like Address, Name, etc from form 
    stripe.customers.create({ 
        email: req.body.stripeEmail, 
        source: req.body.stripeToken, 
        name: 'Gourav Hammad', 
        address: { 
            line1: 'TC 9/4 Old MES colony', 
            postal_code: '452331', 
            city: 'Indore', 
            state: 'Madhya Pradesh', 
            country: 'India', 
        } 
    }) 
    .then((customer) => { 
  
        return stripe.charges.create({ 
            amount: 2500,     // Charing Rs 25 
            description: 'Web Development Product', 
            currency: 'INR', 
            customer: customer.id 
        }); 
    }) 
    .then((charge) => { 
        res.send("Success")  // If no error occurs 
    }) 
    .catch((err) => { 
        res.send(err)       // If some error occurs 
    }); 
}) 


    // var userId = req.body.userId;
    // var type = req.body.type;
    // var productString = req.body.product;
    // if (type === 'performer_subscription' && req.body.performerId) {
    //   UserSubscriptionModel.updateUserSubscription({
    //     userId: req.body.userId,
    //     performerId: req.body.performerId,
    //     subscriptionType: req.body.subscriptionType
    //   }, function(err) {
    //     res.status(err ? 500 : 200).send();
    //   });
    //   //TODO - creae transaction here
    // } else if (productString) {
    //   var productArr = productString.split(',');
    //   async.waterfall([
    //     function(callback) {
    //       if(req.body.couponCode) {
    //         CouponModel.findOne({ code: req.body.couponCode, isActive: true }, function(err, coupon) {
    //           if (err || !coupon) {
    //             return callback(null);
    //           }

    //           if (coupon.useMultipleTimes) {
    //             callback(null, coupon);
    //           } else {
    //             OrderModel.find({'coupon.code': coupon.code}, function(err, data) {
    //               if(err || data.length){
    //                 return callback(null);
    //               }

    //               callback(null, coupon);
    //             });
    //           }
    //         });
    //       } else {
    //         callback(null);
    //       }
    //     },
    //     function (coupon, callback) {
    //       if (coupon) {
    //         CouponModel.update({_id:coupon._id},{ $inc: { used: 1 }}, function(err, update){});
    //       }

    //       async.forEach(productArr, function (item, callback) {
    //         //console.log(item);
    //         var productItem = item.split("-");
    //         var productId = productItem[0];
    //         ProductBusiness.findOne({_id: productId})
    //           .then(function(product) {
    //             //console.log(product)
    //             if (!product) {
    //               return callback('No product');
    //             }

    //             GUserBusiness.findOne({_id: userId}).then(function(user) {
    //               var quantity = productItem[1];
    //               product.quantity = product.quantity - parseInt(quantity);
    //               ProductBusiness.update(product)
    //               var order = {
    //                 user: user._id,
    //                 description: product.name,
    //                 type: 'Store',
    //                 quantity: quantity,
    //                 price: product.price,
    //                 totalPrice: product.price * parseInt(quantity),
    //                 name:req.body.customer_fname + ' '+ req.body.customer_lname,
    //                 address:req.body.address1,
    //                 email:req.body.email,
    //                 phone:req.body.phone_number,
    //                 paymentInformation: req.body,
    //                 status: 'active'
    //               };
    //               if (coupon) {
    //                 order.coupon = coupon;
    //               }

    //               OrderBusiness.create(order,user).then(function(data) {
    //                 var send = {
    //                   template: 'buy_product.html',
    //                   to: user.email,
    //                   subject: config.siteName + ' - Payment successfully',
    //                   user: user,
    //                   product:product
    //                 }
    //                 Mailer.sendMail(send.template, send.to, Object.assign({subject: send.subject}, send), function (err) {});

    //                 callback();
    //              }).catch(err => callback(err));
    //             }).catch(err => callback(err));
    //           }).catch(err => callback(err));
    //       }, function(err) {
    //         callback(err);
    //       });
    //     }
    //   ], function(err, result) {
    //     if (err) {
    //       return res.status(400).send(err);
    //     }

    //     res.status(200).send({ ok: true });
    //   });
    // } else {
    //   res.status(400).send({ ok: false });
    // }
  }
  /**
   * Change a users password
   */

  static changePassword(req, res) {
    if (!req.body.password) {
      return res.status(400).end();
    }

    req.user.password = req.body.password;
    req.user.save(err => res.status(200).send());
  }

  /**
   * Update Profile User
   */
  static updateProfile(req, res, next) {
    //TODO - update validator
    var userId = req.user._id;

    _.merge(req.user, _.pick(req.body.user, [
      'name', 'email', 'phone', 'photo', 'age',
      'firstName', 'lastName', 'dob', 'address', 'gender',
      'country', 'state', 'city'
    ]));
    req.user.save((err, user) => res.status(200).json(user));
  }

   /**
   * Update Profile User
   */
  static update(req, res, next) {
    //TODO - update validator
    var userId = req.body._id;
    GUserBusiness.findOneByAdmin({_id: userId})
      .then(user => {
        if (!user) {
          return res.status(404).send();
        }

        user.name = req.body.name;
        user.age = req.body.age;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.dob = req.body.dob;
        user.address = req.body.address;
        user.gender = req.body.gender;
        user.country = req.body.country;
        user.state = req.body.state;
        user.city = req.body.city;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.status = req.body.status;

        if(req.body.password!='' && typeof req.body.password !='undefined'){
          user.password = req.body.password;
        }
        user.role = req.body.role;
        async.waterfall([
          function(cb) {
            if (req.files.file) {
            
              user.imageType = config.imageType;
              let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
              Func(req.files.file, req.user._id, function(err, result) {
                user.photo  = result.imageFullPath;
                user.imageMediumPath  = result.imageMediumPath;
                user.imageThumbPath  = result.imageThumbPath;
                cb();
              });
          }
        }
        ], function() {
          GUserBusiness.update(user)
            .then(() => res.status(200).json(user))
            .catch(err => validationError(res, 422)(parseJoiError(err)));
        });
    });
  }

  /**
   * Update Photo User
   */
  static updatePhoto(req, res, next) {
    var userId = req.user._id;
    GUserBusiness.findOne({_id: userId})
      .then(user => {
        if (!user) {
          return res.status(404).send();
        }

        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return  cb();
            }

            user.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              user.photo  = result.imageFullPath;
              user.imageMediumPath  = result.imageMediumPath;
              user.imageThumbPath  = result.imageThumbPath;
              cb();
            });
          }
        ], function() {
          GUserBusiness.update(user)
            .then(() => res.status(200).json(user))
            .catch(err => validationError(res, 422)(parseJoiError(err)));
        });
      });
  }

  /**
   *  History download Video
   */
   static downloadVideo(req, res, next) {
      GUserBusiness.findOne({_id: req.user._id}).then(user => {
        if(!user) {
          return validationError(res, 404)({message: 'Not found'});
        }
        if(user.downloadedVideo.length > 0){
          var exist = false;
          for(var i = 0 ; i < user.downloadedVideo.length ; i++){
            if(user.downloadedVideo[i]._id == req.body.video._id){
              exist = true;
            }
          }
        }
        if(!exist){
          user.downloadedVideo.push(req.body.video);
        }else{
          //return res.status(400).json({error:"You've added this video earlier."});
        }
        GUserBusiness.update(user).then(function(user) {
            return res.status(200).json(user);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });
  }

  /**
   * Add favorite Video
   */
   static favoriteVideo(req, res, next) {
      GUserBusiness.findOne({_id: req.user._id}).then(user => {
        if(!user) {
          return validationError(res, 404)({message: 'Not found'});
        }
        if(user.favoriteVideo.length > 0){
          var exist = false;
          for(var i = 0 ; i < user.favoriteVideo.length ; i++){
            if(user.favoriteVideo[i] == req.body.video._id){
              exist = true;
            }
          }
        }
        if(!exist){
          user.favoriteVideo.push(req.body.video._id);
        }else{
          return res.status(400).json({error:"You've added this video earlier."});
        }
        GUserBusiness.update(user).then(function(user) {
            return res.status(200).json(user);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });
  }

  /**
   * Remove favorite Video
   */
   static removeFavoriteVideo(req, res, next) {
      GUserBusiness.findOne({_id: req.user._id}).then(user => {
        if(!user) {
          return validationError(res, 404)({message: 'Not found'});
        }
        user.favoriteVideo = req.body.user.favoriteVideo;
        GUserBusiness.update(user).then(function(user) {
            return res.status(200).json(user);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });
  }

  /**
   * Add watch later Video
   */
   static watchLaterVideo(req, res, next) {
      GUserBusiness.findOne({_id: req.user._id}).then(user => {
        if(!user) {
          return validationError(res, 404)({message: 'Not found'});
        }
        if(user.watchLaterVideo.length > 0){
          var exist = false;
          for(var i = 0 ; i < user.watchLaterVideo.length ; i++){
            if(user.watchLaterVideo[i]._id == req.body.video._id){
              exist = true;
            }
          }
        }
        if(!exist){
          user.watchLaterVideo.push(req.body.video);
        }else{
          return res.status(400).json({error:"You've added this video earlier."});
        }
        GUserBusiness.update(user).then(function(user) {
            return res.status(200).json(user);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });
  }

  /**
   * Remove watch later Video
   */
   static removeWatchLaterVideo(req, res, next) {
      GUserBusiness.findOne({_id: req.user._id}).then(user => {
        if(!user) {
          return validationError(res, 404)({message: 'Not found'});
        }
        user.watchLaterVideo = req.body.user.watchLaterVideo;
        GUserBusiness.update(user).then(function(user) {
            return res.status(200).json(user);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });
  }

  /**
   * Get my info
   */
  static me(req, res, next) {
    if (req.isPerformer) {
      var data = req.user.toJSON();
      return res.status(200).send(Object.assign(_.omit(data, [
        'password'
      ]), {
        isPerformer: true,
        role: 'performer',
        photo: req.user.imageThumbPath
      }));
    }

    res.status(200).send(req.user);
  }

  /**
   * Authentication callback
   */
  static authCallback(req, res, next) {
    res.redirect('/');
  }

  static stats(req, res) {
    //async.waterfall();
  }
}

module.exports = GUserController;
