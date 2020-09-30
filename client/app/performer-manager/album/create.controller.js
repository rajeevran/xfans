'use strict';

angular.module('xMember').controller('AlbumCreateCtrl', function ($scope, $state, growl, albumService, Auth) {
  $scope.title = 'Create Album';
  $scope.me = Auth.getCurrentUser();
  $scope.item = {
    performerIds: [$scope.me._id]
  };
  $scope.albumOptions = {
    photoAlbumId: null,
    hideName: true
  };
  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:5000});
    }

    albumService.create($scope.item).then(function(resp) {
      $scope.albumOptions.upload({
        performerIds: [$scope.me._id],
        name: $scope.item.name,
        photoAlbumId: resp._id
      }, function(err, resp) {
        growl.success('Created!',{ttl:3000});
        $state.go('manager.albumList', { performerId: $scope.me._id });
      });
    })
    .catch(function() {
      growl.error('Something went wrong, please try to refresh and check again.');
    });
  };

  $scope.cancel = function() {
    $state.go('manager.albumList', { performerId: $state.params.performerId });
  };
});
