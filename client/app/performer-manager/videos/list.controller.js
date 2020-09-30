'use strict';

angular.module('xMember').controller('PerformerListVideoCtrl', function ($scope, videoService, Auth, growl, Upload, currentUser) {
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.performer = currentUser;
  $scope.videos = [];
  $scope.maxSize = 10;
  $scope.totalItems = 0;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 12;
  $scope.pageChanged = loadData;
  $scope.filter = {};
  $scope.dateRange = {
    startDate: null,
    endDate: null
  };

  var query = {
    limit: $scope.itemsPerPage,
    offset: 0,
    keyword: '',
    sort: 'activeDate',
    performerId: currentUser._id,
    order: '-1',
    status: '',
    dateFrom: null,
    dateTo: null
  };
  // if ($stateParams.category) {
  //   var category = _.find(categories, function(c) {
  //     return c._id === $stateParams.category || c.alias === $stateParams.category;
  //   });
  //   if (category) {
  //     query.categoryId = category._id;
  //     $scope.filter.categoryId = category._id;
  //   }
  // }

  videoService.countResult(query).then(function(res){
    $scope.totalItems = res.total;
  });

  loadData($scope.currentPage);

  function loadData(page){
    $scope.currentPage = page;
    query.offset = page-1;
    videoService.query(query).then(function(items){
      $scope.videos = items;
      $scope.videos.forEach(video => {
        video.isTaggedin = false;
        if (video.user !== currentUser._id) {
          video.isTaggedin = true;
        }
      });
    });
  }

  $scope.updateFilter = function() {
    if ($scope.filter.keyword) {
      query.keyword = $scope.filter.keyword;
    } else {
      delete query.keyword;
    }

    if ($scope.filter.status) {
      query.status = $scope.filter.status;
    }else {
      delete query.status;
    }

    if($scope.dateRange.startDate && $scope.dateRange.endDate) {
      query.startDate = $scope.dateRange.startDate.toDate();
      query.endDate = $scope.dateRange.endDate.toDate();
    }else {
      delete query.startDate;
      delete query.endDate;
    }

    loadData(1);
    videoService.countResult(query).then(function(res){
      $scope.totalItems = res.total;
    });
  };

  $scope.remove = function(videoId,index) {
    if (window.confirm('Are you sure you want to delete this video?')) {
        videoService.delete(videoId).then(function(res){
            $scope.videos.splice(index, 1);
            growl.success("Deleted successfully",{ttl:3000});
        })
        .catch(()=> growl.error('Some thing went wrong, please try again.', {ttl:3000}))
    }
    else {
      return ;
    }

  };

  $scope.updateStatus = function (video) {
    video.status = video.status === 'active' ? 'inactive' : 'active';
    videoService.update(video._id, video)
    .then(function() {
      growl.success("Updated successfully",{ttl:3000});
      loadData($scope.currentPage);
    });
  };

  $scope.tweet = function(video) {
    videoService.tweet(video._id)
    .then(function() {
      growl.success('Added tweet to queue.', {ttl:3000});
    }, function(e) {
      growl.error(e.data.message, {ttl:3000});
    });
  };
});
