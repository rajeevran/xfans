"use strict";
angular.module('xMember').controller('AffiliateListModelController', function ($scope, $state,affiliateService) {
  $('.table-responsive').css('height', $(window).height());
  $scope.models = [];
  $scope.keyword = '';
  $scope.videos = [];
  $scope.maxSize = 100;
  $scope.totalItems = 0;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 50;

  $scope.query = function(currentPage) {
    affiliateService.getListPerformer({take: $scope.itemsPerPage, page: currentPage}).then((resp)=> {
      $scope.models = resp.items;
      $scope.totalItems = resp.count;
    });
  };
  $scope.query($scope.currentPage);
});

angular.module('xMember').controller('AffiliateListContentController', function ($scope, $state, $stateParams, affiliateService) {
  $('.table-responsive').css('height', $(window).height());
  $scope.videos = [];
  $scope.maxSize = 100;
  $scope.totalItems = 0;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 20;

  $scope.query = function(currentPage) {
    affiliateService.search({performerId: $stateParams.performerId, take: $scope.itemsPerPage, page: currentPage}).then((resp)=> {
      $scope.videos = resp.items;
      $scope.totalItems = resp.count;
    });
  };
  $scope.query($scope.currentPage);

  // $scope.downloadAll = function() {
  //   let items =  document.getElementsByClassName('downloadItem');
  //   angular.forEach(items, function(item) {
  //     console.log(item);
  //     item.click();
  //   });
  // };
});
