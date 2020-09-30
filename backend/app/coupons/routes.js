'use strict';

angular.module('xMember').config(function($stateProvider) {
  $stateProvider.state('coupons', {
    url: '/coupons',
    template: '<ui-view/>'
  })
  .state('coupons.create', {
    url: '/create',
    templateUrl: 'app/coupons/views/create.html',
    controller: 'CouponCreateCtrl',
    data: {
      pageTitle: 'Create new coupon',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  })
  .state('coupons.update', {
    url: '/:id/update',
    templateUrl: 'app/coupons/views/update.html',
    controller: 'CouponUpdateCtrl',
    resolve: {
      item: function(couponService, $stateParams) {
        return couponService.findOne($stateParams.id);
      }
    },
    data: {
      pageTitle: 'Update coupon',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  })
  .state('coupons.list', {
    url: '/list',
    templateUrl: 'app/coupons/views/list.html',
    controller: 'CouponListCtrl',
    data: {
      pageTitle: 'Coupons',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });
});
