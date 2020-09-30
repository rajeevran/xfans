'use strict';

angular.module('xMember').controller('AffiliateAccountCreateCtrl', function ($scope, $state, growl, affiliateService) {
  $scope.info = {
    name: '',
    username: '',
    password: ''
  };
  $scope.action = "Create new";

  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:5000});
    }

    affiliateService.create($scope.info).then(function(resp) {
      growl.success('Created successfully!', {ttl:3000});
      $state.go('affiliateAccountListing');
    })
    .catch(function() {
      growl.error('Something went wrong, please try to refresh and check again.',{ttl:3000});
    });
  };
});

angular.module('xMember').controller('AffiliateAccountEditCtrl', function ($scope, $state, growl, affiliateService, item) {
  $scope.info = item;
  $scope.action = "Update";

  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:5000});
    }

    affiliateService.update(item._id, $scope.info).then(function(resp) {
      growl.success('Edited successfully!', {ttl:3000});
      $state.go('affiliateAccountListing');
    })
    .catch(function() {
      growl.error('Something went wrong, please try to refresh and check again.', {ttl:3000});
    });
  };
});

angular.module('xMember').controller('AffiliateAccountListCtrl', function ($scope, $state, growl, affiliateService) {
  $scope.items = [];
  $scope.maxSize = 10;
  $scope.totalItems = 10;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 12;

  $scope.query = function(currentPage) {
    affiliateService.search({take: $scope.itemsPerPage, page: currentPage}).then((resp) => {
      $scope.items = resp.items;
      $scope.totalItems = resp.count;
    });
  };

  $scope.query($scope.currentPage);
});
