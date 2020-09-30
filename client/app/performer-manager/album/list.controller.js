'use strict';

angular.module('xMember').controller('AlbumListCtrl', function ($scope, $state, growl, albumService, Auth) {
  $scope.items = [];
  $scope.user = Auth.getCurrentUser();
  $scope.performerId = $scope.user._id;

  albumService.find({
    performerId: $scope.performerId
  }).then(function(resp) {
    $scope.items = resp.items;
    $scope.totalItem = resp.count;
  });

  $scope.delete = function(item, $index) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    albumService.delete(item._id).then(function() {
      $scope.items.splice($index, 1);
    });
  };
});
