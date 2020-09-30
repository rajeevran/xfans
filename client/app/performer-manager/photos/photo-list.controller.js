'use strict';

angular.module('xMember').controller('PerformerListPhotoCtrl', function ($scope, Auth, photoService, growl, currentUser) {
  $scope.performer = Auth.getCurrentUser();

  $scope.photos = [];
  $scope.maxSize = 10;
  $scope.totalItems = 10;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 15;
  $scope.pageChanged = loadData;
  loadData($scope.currentPage);

  function loadData(currentPage) {
    photoService.search({take: $scope.itemsPerPage, page: currentPage, performerId: currentUser._id})
    .then(function (res) {
        $scope.photos = res.items;
        $scope.totalItems = res.count;
    });
  };

  $scope.remove = function(photoId,index) {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    photoService.delete(photoId).then(function(res){
      if(res){
        $scope.photos.splice(index, 1);
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  };

});
