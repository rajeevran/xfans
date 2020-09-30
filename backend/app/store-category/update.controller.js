'use strict';

angular.module('xMember').controller('ProductCategoryUpdateCtrl', function ($scope, $state, growl, productCategoryService, item) {
  $scope.item = item;
  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:5000});
    }

    productCategoryService.update($scope.item._id, $scope.item).then(function() {
      growl.success('Updated!',{ttl:3000});
      $state.go('productCategories.list');
    });
  };
});
