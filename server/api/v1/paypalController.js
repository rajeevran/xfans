'use strict';
import async from 'async';
import { SettingModel } from '../../models';
import {Paypal} from '../../components';
import { PaymentBusiness } from '../../businesses';
import config from '../../config/environment';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

class PaypalController {

  static init(req, res, next) {
    SettingModel.findOne().exec().then(setting => {
      //console.log(setting)
      if (!setting || !setting.paypal || !setting.paypal.username) {
        return res.status(404).end();
      }
      req.paypal = setting.paypal;
      next();
    })
      .catch(err => next(err));
  }

  static doDirectPayment(req, res) {
    //get products/package
    PaymentBusiness.getPaymentInfo(req.body)
      .then(transaction => {
        //create paypal token
        transaction.provider = 'paypal';
        if (req.user) {
          transaction.user = req.user._id;
        }else if(req.body.userId){
          transaction.userId = req.body.userId;
        }
        //console.log(transaction);
        //add transaction
        PaymentBusiness.createTransaction(transaction)
          .then(transaction => {
            Paypal(req.paypal).createToken(transaction)
              .then(paypal=> {
                //response redirect URl
                res.status(200).json(paypal);
              })
              .catch(err => {
                validationError(res, 422)('Paypal can\'t handle post data. Please contact support!');
              });
          })
          .catch(err => {
            //console.log(err);
            validationError(res, 422)(err);
          });
      })
      .catch(err => {
        handleError(res, 400)(err);
      });
  }

  static updateTransaction(req, res) {
    Paypal(req.paypal).getExpressCheckoutDetails(req.body.token)
      .then(paypal => {
        PaymentBusiness.updateTransaction(paypal)
          .then(data=>{
            let redirectUrl = '';
            if(data.type){
              if(data.type==='signup'){
                redirectUrl = `payment/payment-success?type=${data.type}`;
              }else{
                redirectUrl = `payment/buy-success?type=${data.type}`;
              }
            }
            res.status(200).json({redirectUrl: config.baseUrl + redirectUrl});
          })
          .catch(err => {
            handleError(res, 400)('Our system has error. Please contact support to update your payment');
          });
      })
      .catch(err => {
        validationError(res, 422)(err);
      });
  }

}

module.exports = PaypalController;
