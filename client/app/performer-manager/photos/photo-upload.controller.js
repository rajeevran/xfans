'use strict';

angular.module('xMember').controller('PerformerUploadPhotoCtrl', function ($scope, $state, $timeout, photoService, Upload, performer, growl) {
  $scope.action = 'Add';
  $scope.photoData = {
    name:'',
    imageThumbPath:null,
    imageFullPath:null,
    description:'',
    sort:0,
    status:'active',
    performer: [performer._id]
  };
  $scope.select2Options = {
    multiple: true,
    allowClear:true
  };
  $scope.progressPercentage = 0;
  $scope.files = null;
  $scope.submitForm = function(form, files){
    $scope.submitted = true;
    if (!files) {
      return growl.error('Please select file')
    }
    if (form.$valid) {
        Upload.upload({
          url: '/api/v1/photos',
          method: 'POST',
          data: $scope.photoData,
          file: [files]
        }).then(function (response) {
          $timeout(function () {
            if (response) {
              growl.success('Added successfully', {ttl: 3000});
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
