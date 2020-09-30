'use strict';

angular.module('xMember').controller('PerformerEditPhotoCtrl', function ($scope, $state, $timeout, photoService, Upload, performer, growl, photo) {
  $scope.action = 'Edit';
  $scope.photoData = photo;
  $scope.select2Options = {
    multiple: true,
    allowClear:true
  };
  $scope.progressPercentage = 0;

  $scope.submitForm = function(form, files){
    $scope.submitted = true;
    if (form.$valid) {
        Upload.upload({
          url: '/api/v1/photos/'+ $scope.photoData._id,
          method: 'PUT',
          data: $scope.photoData,
          file: files
        }).then(function (response) {
          $timeout(function () {
            if (response) {
              growl.success('Updated successfully', {ttl: 3000});
              $state.go('manager.photos');
            }
          });
        }, function (response) {
          if (response.status > 0) {
            $scope.errorMsg = response.status + ': ' + response.data;
          }
        }, function (evt) {
          $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.safeApply();
        });
    }
  };


  photoService.findPerformerAlbums(performer._id)
    .then(function(resp) {
      $scope.albums = resp.items;
    });
});
