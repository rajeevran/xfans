'use strict';

angular.module('xMember').controller('CouponListCtrl', function ($scope, $state, growl, couponService) {
  $scope.items = [];
  $scope.currentPage = 1;

  function query() {
    couponService.find({ page: $scope.currentPage }).then(function(resp) {
      $scope.items = resp.items;
      $scope.count = resp.count;
    });
  }

  $scope.pageChanged = function() {
    query();
  };

  query();

  $scope.delete = function(item, $index) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    couponService.delete(item._id).then(function() {
      $scope.items.splice($index, 1);
    });
  };
});
