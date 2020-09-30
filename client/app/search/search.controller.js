'use strict';

angular.module('xMember').controller('SearchCtrl', function($scope, $stateParams, searchService, categoriesService, productService, ngCart,  growl) {
  $scope.type = $stateParams.type || 'video';
  $scope.categories = [];
  $scope.items = [];
  $scope.currentPage = 1;
  $scope.pageSize = 100;
  $scope.params = $stateParams;
  $scope.stats = {};
  $scope.totalResult = 0;
  $scope.productCategory = '';
  $scope.videoCategory = '';
  $scope.q = $stateParams.q;
  $scope.p = $stateParams.p;

  function search(page, options) {
    $scope.currentPage = 1;
    if (!options) {
      options = {};
    }
    if ($scope.type === 'video') {
      categoriesService.findAll().then(resp => $scope.categories = resp);
    }
    if ($scope.type === 'product') {
      productService.findCategories().then(resp => $scope.categories = resp.items);
    }
    searchService.findItems($scope.type, _.merge({
      page,
      take: $scope.pageSize,
      q: $scope.q,
      type: $scope.type,
      performerId: $scope.p
    }, options)).then(resp => {
      $scope.totalItem = resp.count;
      $scope.items = resp.items;
    });
    // searchService.stats({ q: $scope.q }).then(resp => {
    //   $scope.stats = resp;
    //   $scope.totalResult = resp.video + resp.product + resp.performer;
    // });
  }

  $scope.pageChanged = search;
  $scope.filterCategory = function(type, catId) {
    if (type === 'video') {
      $scope.videoCategory = catId;
    } else if (type === 'product') {
      $scope.productCategory = catId;
    }

    search(1, {
      categoryId: catId
    });
  };

  $scope.changeType = function(type) {
    $scope.type = type;
    search(1);
  };

  $scope.filter = {
    q: $scope.q
  };
  $scope.filterModel = function() {
    $scope.type = 'performer';
    $scope.q = $scope.filter.q;
    search(1, $scope.filter);
  };

  search(1);

  $scope.buy = function(product) {
    $scope.exist = false;
     angular.forEach(ngCart.getItems(), function(item) {
        if (item._id === product._id) {
          growl.error('You have previously added products', {ttl: 3000});
          $scope.exist = true;
          return false;
        }
      });
      if(!$scope.exist){
        ngCart.addItem(product._id,product.name,product.price,1,product);
        growl.success('Add product to cart successfully', {ttl: 3000});
      }
  };
});
