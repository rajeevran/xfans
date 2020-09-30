'use strict';

angular.module('xMember').controller('ProductCategoryListCtrl', function ($scope, $state, growl, productCategoryService) {
  $scope.items = [];

  productCategoryService.find().then(function(resp) {
    $scope.items = resp.items;
    $scope.totalItem = resp.count;
  });

  $scope.delete = function(item, $index) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    productCategoryService.delete(item._id).then(function() {
      $scope.items.splice($index, 1);
    });
  };
});
