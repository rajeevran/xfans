(function (angular) {
  'use strict';

  angular.module('xMember').controller('MoviesCtrl', MoviesCtrl);

  function MoviesCtrl($scope, $stateParams, videoService, perfomerService, categories) {
    $scope.videos = [];
    $scope.maxSize = 10;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10000;
    $scope.categories = categories;
    $scope.pageChanged = loadData;
    $scope.isSale = $stateParams.isSale;
    $scope.filter = {};
    var query = {
      limit: $scope.itemsPerPage,
      type: $stateParams.type,
      offset: 0,
      keyword: '',
      sort: 'sort',
      performer: $stateParams.performerId || '',
      order: '1',
      isSaleVideo: $stateParams.isSale
    };
    if ($stateParams.category) {
      var category = _.find(categories, function(c) {
        return c._id === $stateParams.category || c.alias === $stateParams.category;
      });
      if (category) {
        query.categoryId = category._id;
        $scope.filter.categoryId = category._id;
      }
    }

    videoService.countResult(query).then(function(res){
      $scope.totalItems = res.total;
    });

    loadData($scope.currentPage);

    function loadData(page){
      query.offset = page-1;
      videoService.query(query).then(function(items){
        $scope.videos = items;
      });
    }

    $scope.performers = [];
    $scope.searchPerformers = function(keyword) {
      perfomerService.search({ keyword }).then(data => {
        $scope.performers = data.items;
      });
    };

    $scope.updateFilter = function() {
      if ($scope.filter.performer) {
        query.performerId = $scope.filter.performer._id;
      } else {
        delete query.performerId;
      }
      if ($scope.filter.categoryId) {
        query.categoryId = $scope.filter.categoryId;
      } else {
        delete query.categoryId;
      }
      if ($scope.filter.keyword) {
        query.keyword = $scope.filter.keyword;
      } else {
        delete query.keyword;
      }

      loadData(1);
      videoService.countResult(query).then(function(res){
        $scope.totalItems = res.total;
      });
    };
  }
})(angular);
