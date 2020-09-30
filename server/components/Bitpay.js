'use strict';
import config from '../config/environment';
import request from 'request';

const ipnUrl = config.baseUrl + 'api/v1/bitpay/callback';
const packageReturnUrl = config.baseUrl + 'payment-success';
const productReturnUrl = config.baseUrl + 'buy-success';

module.exports = function (config) {
  let httpOptions = {
    auth: {
      user: config.apiKey,
      pass: '',
      sendImmediately: true
    }
  };
  let baseUrl = "https://bitpay.com";
  if(config.sandbox) {
    baseUrl = "https://test.bitpay.com";
  }

  return {
    createToken(transaction, options){
      options = options || {};

      return new Promise((resolve, reject) => {
        if(transaction.coupon && transaction.coupon._id){
          let price = 0;
          if(transaction.coupon.discountType === 'amount'){
            price = -transaction.coupon.discountValue;
          }else{
            price = -parseFloat((transaction.price * transaction.coupon.discountValue)/100).toFixed(2);
          }
          transaction.price += price;
        }
        let invoiceOptions = {
          price: transaction.price,
          currency: 'USD',
          fullNotifications: true,
          notificationURL: ipnUrl,
          redirectURL: productReturnUrl,
          posData: transaction._id.toString(),
          itemDesc: transaction.description
        };
        if(transaction.userId){
          invoiceOptions.redirectURL = packageReturnUrl;
        }
        let options = new Object(httpOptions);
        options.method = "POST";
        options.url = baseUrl+"/api/invoice";
        options.form = invoiceOptions;

        request(options, function(err, resp, body) {
          let result = JSON.parse(body);
          if (result.error) {
            reject(result.error);
          } else {
            resolve(result);
          }
        });
      });
    },
    getExpressCheckoutDetails(invoiceId){
      return new Promise((resolve, reject) => {
        let options = new Object(httpOptions);
        options.url = baseUrl+'/api/invoice/'+invoiceId;
        options.methd = 'GET';
        request(options, function(err, resp, body) {
          let result = JSON.parse(body);
          if (result.error) {
            reject(result.error);
          } else {
            result.transactionId = result.posData;
            result.paymentStatus = result.status;
            result.status = 'failed';
            if (result.paymentStatus === 'confirmed') {
              result.status = 'completed'
            } else if (result.paymentStatus === 'paid') {
              result.status = 'pending'
            }
            resolve(result);
          }
        });
      });
    }
  };
};
