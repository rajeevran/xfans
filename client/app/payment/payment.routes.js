(function (angular) {
  'use strict';

  angular.module('xMember')
    .config(categoriesRoute);

  function categoriesRoute($stateProvider) {
    $stateProvider
      .state('payment', {
        url: '/direct/payment?type&package&userId&performerId&videoId',
        templateUrl: 'app/payment/payment.html',
        controller: 'PaymentCtrl',
        data: {
          pageTitle: 'Payment',
          metaKeywords: 'Description',
          metaDescription: 'sex, sex tour, xmember, video'
        },
        resolve:{
          plan: getPackage,
          serverSetting: function(settingService) {
            return settingService.find().then(function(data) {
              return data.data;
            });
          },
          performer($stateParams, perfomerService) {
            if ($stateParams.type === 'performer_subscription' || $stateParams.type === 'tip_performer') {
              return perfomerService.find($stateParams.performerId).then(resp => resp.data);
            }

            return null;
          },
          video($stateParams, videoService) {
            if ($stateParams.type === 'sale_video') {
              return videoService.find($stateParams.videoId).then(function(data){
                return data.data;
              });
            }

            return null;
          }
        }
      })
      .state('paypalSuccess', {
        url: '/payment/paypal-success?token&PayerID',
        resolve:{
          redirect: function(paymentService, $stateParams){
            return paymentService.callback('paypal', {token: $stateParams.token});
          }
        }
      });
  }

  function getPackage($stateParams, memberPackageService, $state){
    if($stateParams.package && $stateParams.type !== 'performer_subscription'){
      return memberPackageService.find($stateParams.package).then(function(res){
        return res.data;
      }, function(){
        $state.go('signup');
      });
    }else{
      return '';
    }
  }

})(angular);
