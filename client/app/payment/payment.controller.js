(function (angular) {
  'use strict';

  angular.module('xMember').controller('PaymentCtrl', PaymentCtrl);

  function PaymentCtrl($scope, growl, $state, $stateParams, Auth, paymentService, plan, ngCart, serverSetting, performer, video) {
    $scope.package = plan;
    $scope.provider = 'ccbill';

    $scope.user = Auth.getCurrentUser();
    $scope.coupon = '';
    $scope.paymentType = $stateParams.type;
    $scope.subscriptionType = 'yearly';
    $scope.performer = performer;
    $scope.video = video;
    $scope.totalPrice = 0;
    $scope.tip = {
      amount: 10
    };
    $scope.havePaymentGateway = true;
    $scope.serverSetting = serverSetting;
    if (!serverSetting.ccbillEnable && !serverSetting.paypalEnable && !serverSetting.bitpayEnable) {
      $scope.havePaymentGateway = false;
    }

    if ($stateParams.type === 'product') {
      $scope.products = ngCart.getItems();
      $scope.total = 0;
      $scope.products.forEach(i => $scope.total += i.getQuantity() * i.getPrice());
      if (!Auth.isLoggedIn()) {
        growl.error("Please signup or login before buy product",{ttl:3000});
        return $state.go('login');
      }
    } else if($stateParams.type === 'upgrade') {
      if(!Auth.isLoggedIn()){
        growl.error("Please signup or login before upgrade account",{ttl:3000});
        $state.go('login');
        return false;
      }
    } else if($stateParams.type === 'performer_subscription') {
      if (!Auth.isLoggedIn()) {
        growl.error("Please signup or login before upgrade account",{ttl:3000});
        $state.go('login');
        return false;
      }

      if ($stateParams.package === 'monthly') {
        $scope.subscriptionType = 'monthly';
        $scope.totalPrice = performer.subscriptionMonthlyPrice;
      } else {
        $scope.totalPrice = performer.subscriptionYearlyPrice;
      }
    } else if($stateParams.type === 'tip_performer') {
      if (!Auth.isLoggedIn()) {
        growl.error("Please signup or login before upgrade account",{ttl:3000});
        return $state.go('login');
      }
    } else if($stateParams.type === 'sale_video') {
      if (!Auth.isLoggedIn()) {
        growl.error("Please signup or login before upgrade account",{ttl:3000});
        return $state.go('login');
      }
    } else if(!$stateParams.userId){
      return $state.go('signup');
    }

    if($scope.package && $stateParams.type !== 'performer_subscription'){
      $scope.total = $scope.package.price;
    }
    if (video) {
      $scope.total = video.price;
    }

    $scope.doRedirect = doRedirect;
    $scope.checkCoupon = checkCoupon;

    function doRedirect(){
      if ($scope.paymentType === 'tip_performer' && $scope.tip.amount < 0) {
        return growl.error('Please enter tip amount!');
      }

      var paymentInfo = {};
      if($scope.provider === 'ccbill'){
        paymentInfo = ccbill(paymentInfo);
      }else{
        paymentInfo = setPaymentInfo(paymentInfo);
      }
      paymentInfo.coupon = $scope.coupon;
      paymentService.doDirectPayment($scope.provider, paymentInfo);
    }

    function ccbill(paymentInfo){
      if ($stateParams.type === 'product') {
        paymentInfo = {
          type: 'product',
          userId: $scope.user._id,
          products: _.map($scope.products, function(p) {
            let i = p.getData();
            return {
              productId: i._id,
              quantity: p.getQuantity()
            };
          })
        };
      } else if ($stateParams.type === 'performer_subscription') {
        paymentInfo = {
          formPrice: $scope.totalPrice,
          formPeriod: '30',
          type: 'performer_subscription',
          userId: $scope.user._id,
          performerId: $scope.performer._id,
          subscriptionType: $scope.subscriptionType
        };
      } else if ($stateParams.type === 'tip_performer') {
        paymentInfo = {
          formPrice: $scope.tip.amount,
          formPeriod: '30',
          type: 'tip_performer',
          userId: $scope.user._id,
          performerId: $scope.performer._id
        };
      } else if ($stateParams.type === 'sale_video') {
        paymentInfo = {
          formPrice: video.price,
          formPeriod: '30',
          type: 'sale_video',
          userId: $scope.user._id,
          videoId: video._id
        };
      } else {
        paymentInfo = {
          formPrice: parseFloat($scope.package.price).toFixed(2),
          formPeriod: $scope.package.numberDay,
          type: $stateParams.type=== 'upgrade'?'update':'new',
          userId: $stateParams.type=== 'upgrade'?$scope.user._id:$stateParams.userId,
          packageId: $scope.package._id
        };
        if($scope.package.type==='subscriptions'){
           paymentInfo = angular.merge(paymentInfo, {
             formRecurringPrice: paymentInfo.formPrice,
             formRecurringPeriod: paymentInfo.formPeriod,
             formRebills: 99
           });
        }
      }
      return paymentInfo;
    }

    function setPaymentInfo(paymentInfo){
      if($stateParams.type ==='product'){
        var products={};
        angular.forEach($scope.items,function(item){
          products[item._id]= item._quantity;
        });
        paymentInfo.products = products;
      } else if ($stateParams.type === 'performer_subscription') {
        //donothing now
        paymentInfo = {
          formPrice: $scope.totalPrice,
          formPeriod: '30',
          type: 'performer_subscription',
          performerId: $scope.performer._id,
          subscriptionType: $scope.subscriptionType
        };
      } else if ($stateParams.type === 'tip_performer') {
        //donothing now
        paymentInfo = {
          formPrice: $scope.tip.amount,
          formPeriod: '30',
          type: 'tip_performer',
          performerId: $scope.performer._id
        };
      } else if ($stateParams.type === 'sale_video') {
        //donothing now
        paymentInfo = {
          formPrice: video.price,
          formPeriod: '30',
          type: 'sale_video',
          videoId: video._id
        };
      } else{
        if($stateParams.type ==='signup'){
          paymentInfo.userId = $stateParams.userId;
        }
        paymentInfo.package = $scope.package._id;
      }
      return paymentInfo;
    }

    function checkCoupon(){
      paymentService.getCoupon($scope.couponCode).then(function(resp){
        let validDate = true;
        if (resp.data.expiredDate) {
          validDate = new Date() <= new Date(resp.data.expiredDate);
        }
        if (resp.data.used >= resp.data.numberUse || !validDate) {
          return growl.error('Sorry, you can not use this coupon any more!', {ttl: 3000});
        }
        $scope.coupon = resp.data;
      }).catch(function(resp){
        growl.error(resp.data,{ttl:3000});
      });
    }
  }
})(angular);
