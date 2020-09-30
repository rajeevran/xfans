'use strict';

angular.module('xMember').controller('ProductCategoryCreateCtrl', function ($scope, $state, growl, productCategoryService) {
  $scope.item = {};
  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:5000});
    }

    productCategoryService.create($scope.item).then(function() {
      growl.success('Created!',{ttl:3000});
      $state.go('productCategories.list');
    });
  };
});
