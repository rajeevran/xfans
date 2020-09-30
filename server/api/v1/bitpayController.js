'use strict';
import async from 'async';
import {Bitpay} from '../../components';
import { SettingModel } from '../../models';
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
      if (!setting || !setting.bitpay || !setting.bitpay.apiKey) {
        return res.status(404).end();
      }
      req.bitpay = setting.bitpay;
      next();
    })
      .catch(err => next(err));
  }

  static doDirectPayment(req, res) {
    //get products/package
    PaymentBusiness.getPaymentInfo(req.body)
      .then(transaction => {
        //create paypal token
        transaction.provider = 'bitpay';
        if (req.user) {
          transaction.user = req.user._id;
        }else if(req.body.userId){
          transaction.userId = req.body.userId;
        }

        //add transaction
        PaymentBusiness.createTransaction(transaction)
          .then(transaction => {
            Bitpay(req.bitpay).createToken(transaction)
              .then(bitpay=> {
                //response redirect URl
                res.status(200).json({redirectUrl: bitpay.url});
              })
              .catch(err => {
                validationError(res, 422)(err);
              });
          })
          .catch(err => {
            validationError(res, 422)(err);
          });
      })
      .catch(err => {
        handleError(res, 400)(err);
      });
  }

  static updateTransaction(req, res) {
    //console.log(req.body.token);
    //return res.status(400).send();
    Bitpay(req.bitpay).getExpressCheckoutDetails(req.body.id)
      .then(bitpay => {
        PaymentBusiness.updateTransaction(bitpay)
          .then(data => console.log(data))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));

    res.status(200).send();
  }

}

module.exports = PaypalController;
