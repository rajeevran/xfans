'use strict';

angular.module('xMember').config(function($stateProvider) {
  $stateProvider.state('productCategories', {
    url: '/products/categories',
    template: '<ui-view/>'
  })
  .state('productCategories.create', {
    url: '/create',
    templateUrl: 'app/store-category/views/create.html',
    controller: 'ProductCategoryCreateCtrl',
    data: {
      pageTitle: 'Store category create',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  })
  .state('productCategories.update', {
    url: '/:id/update',
    templateUrl: 'app/store-category/views/update.html',
    controller: 'ProductCategoryUpdateCtrl',
    resolve: {
      item: function(productCategoryService, $stateParams) {
        return productCategoryService.findOne($stateParams.id);
      }
    },
    data: {
      pageTitle: 'Store category update',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  })
  .state('productCategories.list', {
    url: '/list',
    templateUrl: 'app/store-category/views/list.html',
    controller: 'ProductCategoryListCtrl',
    data: {
      pageTitle: 'Store categories',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });
});
