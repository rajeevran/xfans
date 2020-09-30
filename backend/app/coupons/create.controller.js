'use strict';
angular.module('xMember').controller('CouponCreateCtrl', function ($scope, $state, growl, couponService, productService) {
  $scope.item = {
    discountType: 'percentage',
    discountValue: 10,
    useMultipleTimes: true,
    isActive: true,
    expiredDate: new Date()
  };

  $scope.select2Options = {
    'multiple': true,
    'simple_tags': true
  }

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2030, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  $scope.open2 = function () {
    $scope.popup2.opened = true;
  };
  $scope.popup2 = {
    opened: false
  };
  $scope.setDate = function (year, month, day) {
    $scope.item.expiredDate = new Date(year, month, day);
  };
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }
  $scope.products = [];
  $scope.query = {
    keyword: '',
    sort: 'createdAt',
    order: -1
  };
  $scope.currentPage = 1;
  $scope.itemsPerPage = 1000;
  productService.findAll($scope.itemsPerPage, $scope.currentPage - 1, $scope.query).then(function (data) {
    $scope.products = data.data;
  });

  $scope.submit = function (frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!');
    }

    couponService.create($scope.item).then(function () {
      growl.success('Created!');
      $state.go('coupons.list');
    });
  };
});
