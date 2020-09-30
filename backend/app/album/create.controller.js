'use strict';

angular.module('xMember').controller('AlbumCreateCtrl', function ($scope, $state, growl, albumService) {
  $scope.item = {
    performerIds: [$state.params.performerId]
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
        performerIds: [$state.params.performerId],
        name: $scope.item.name,
        photoAlbumId: resp._id
      }, function(err, resp) {
        growl.success('Created!',{ttl:3000});
        $state.go('albums.list', { performerId: $state.params.performerId });
      });
    })
    .catch(function() {
      growl.error('Something went wrong, please try to refresh and check again.');
    });
  };
});
