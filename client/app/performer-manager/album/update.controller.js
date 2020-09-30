'use strict';

angular.module('xMember').controller('AlbumUpdateCtrl', function ($scope, $state, growl, albumService, item) {
  $scope.title = 'Edit Album';
  $scope.item = item;
  $scope.albumOptions = {
    photoAlbumId: item._id,
    hideName: true
  };

  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:5000});
    }

    albumService.update(item._id, $scope.item).then(function() {
      $scope.albumOptions.upload({
        photoAlbumId: item._id,
        performerIds: item.performerIds,
        name: item.name
      }, function(err, resp) {
        growl.success('Updated!',{ttl:3000});
        $state.go('manager.albumList', { performerId: $state.params.performerId });
      });
    })
    .catch(function() {
      growl.success('Something went wrong, please try to refresh and check again!',{ ttl:3000 });
    });
  };

  $scope.cancel = function() {
    $state.go('manager.albumList', { performerId: $state.params.performerId });
  };
});
