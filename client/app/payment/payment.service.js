"use strict";
angular.module('xMember')
  .factory('paymentService', function (settingService, $http, md5) {
    var ccbillUrl = "https://bill.ccbill.com/jpost/signup.cgi";
    var setting = {};

    settingService.find().then(function(data){
      setting =  data.data;
    });

    return {
      getCoupon: getCoupon,
      doDirectPayment: doDirectPayment,
      callback: paymentCallback
    };

    function getCoupon(code){
      return $http.get('/api/v1/coupon?code='+code);
    }

    function doDirectPayment(provider, paymentInfo){
      switch (provider){
        case 'ccbill':
          if(paymentInfo.coupon){
            paymentInfo.formPrice = parseFloat(calculateDiscount(paymentInfo.coupon, paymentInfo.formPrice)).toFixed(2);
          }
          ccbillRequest(paymentInfo);
          break;
        case 'paypal':
          paypalDoDirectPayment(paymentInfo);
          break;
        case 'bitpay':
          bitpayDoDirectPayment(paymentInfo);
          break;
      }
    }

    function ccbillSubscription(data){
      var params = angular.merge({
        clientAccnum: setting.clientAccnumSubscriptions,
        clientSubacc: setting.clientSubaccSubscriptions,
        formName: setting.formNameSubscriptions,
        currencyCode: setting.currencyCodeSubscriptions
      }, data);
      if(data.coupon){
        params.couponCode = data.coupon.code;
      }
      if(params.formRecurringPrice){
        params.formDigest = md5.createHash(params.formPrice+params.formPeriod+
        params.formRecurringPrice+params.formRecurringPeriod+params.formRebills+
        params.currencyCode+setting.saltSubscriptions);
      }else{
        params.formDigest = md5.createHash(params.formPrice+params.formPeriod+params.currencyCode+setting.saltSubscriptions);
      }
      window.location.href = ccbillUrl + "?" +  jQuery.param( params );
    }

    function ccbillProduct(data){
      var params = angular.merge({
        clientAccnum: setting.clientAccnumSingle,
        clientSubacc: setting.clientSubaccSingle,
        formName: setting.formNameSingle,
        currencyCode: setting.currencyCodeSingle
      }, data);
      if(data.coupon){
        params.couponCode = data.coupon.code;
      }
      params.formDigest = md5.createHash(params.formPrice+params.formPeriod+params.currencyCode+setting.saltSingle);

      window.location.href = ccbillUrl + "?" +  jQuery.param( params );
    }

    function ccbillRequest(data) {
      $http.post('/api/v1/payment/ccbill', data)
        .success(function(resp) {
          window.location.href = resp.redirectUrl;
        });
    }

    function paypalDoDirectPayment(data){
      var param = data.userId ? 'signup' : 'payment';
      $http.post('/api/v1/paypal/'+param, data)
        .success(function(resp){
          window.location.href = resp.redirectUrl;
        });
    }

    function bitpayDoDirectPayment(data){
      var param = data.userId ? 'signup' : 'payment';
      $http.post('/api/v1/bitpay/'+param, data)
        .success(function(resp){
          window.location.href = resp.redirectUrl;
        });
    }

    function paymentCallback(provider, data){
      if(provider==='paypal'){
        $http.post('/api/v1/paypal/callback', data)
          .success(function(resp){
            window.location.href = resp.redirectUrl;
          });
      }
    }

    function calculateDiscount(coupon, price){
      if(coupon.discountType==='amount'){
        price -= coupon.discountValue;
      }else{
        price = price - (price * coupon.discountValue)/100;
      }
      return price;
    }
  });
