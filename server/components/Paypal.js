'use strict';
import Paypal from 'paypal-express-checkout-dt';
import config from '../config/environment';

let returnUrl = config.baseUrl + 'paypal-success';
let cancelUrl = config.baseUrl;

module.exports = function (config) {
  let paypal = Paypal.create(
    config.username,
    config.password,
    config.signature,
    config.sandbox
  );

  return {
    createToken(transaction){
      return new Promise((resolve, reject) => {
        if (transaction.products && transaction.products.length) {
          let products = transaction.products.map(prod=> {
            return {
              name: prod.name,
              quantity: prod.quantity,
              amount: prod.price
            };
          });
          if(transaction.coupon && transaction.coupon._id){
            let price = 0;
            if(transaction.coupon.discountType === 'amount'){
              price = -transaction.coupon.discountValue;
            }else{
              price = -parseFloat((transaction.price * transaction.coupon.discountValue)/100).toFixed(2);
            }
            products.push({
              name: transaction.coupon.name,
              quantity: 1,
              amount: price
            });

            transaction.price += price;
          }
          paypal.setProducts(products);
        }
        paypal.setExpressCheckoutPayment(
          '',
          transaction._id,
          transaction.price,
          transaction.description,
          'USD',
          returnUrl,
          cancelUrl,
          false,
          function (err, data) {
            if (err) {
              return reject(err);
            }
            // Regular paid.
            resolve(data);
          });
      });
    },
    getExpressCheckoutDetails(token){
      return new Promise((resolve, reject) => {
        paypal.getExpressCheckoutDetails(token, true, function(err, data) {
          /* update the info in payment system whether is successfully or not */
          data.status = 'failed';
          if (data.PAYMENTINFO_0_ACK === 'Success' && data.PAYMENTINFO_0_PAYMENTSTATUS === 'Completed') {
            data.status = 'completed'
          } else if (data.PAYMENTINFO_0_ACK === 'Success' && data.PAYMENTINFO_0_PAYMENTSTATUS === 'Pending') {
            data.status = 'pending'
          }
          let custom =data.PAYMENTREQUEST_0_CUSTOM.split('|');
          data.transactionId = custom[0];
          resolve(data);
        });
      });
    }
  };
};
