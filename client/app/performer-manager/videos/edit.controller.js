'use strict';

angular.module('xMember').controller('PerformerVideoEditCtrl', function ($scope, $state, $timeout, photoService,
  Upload, growl, categories, performer, video, performers, videoService) {
  $scope.action = 'Edit';
  $scope.video = video;
  if ($scope.video.schedule) {
    $scope.video.schedule = new Date($scope.video.schedule);
  }
  $scope.isSchedule = video.isSchedule;
  $scope.categories = categories;
  $scope.performers = performers;
  $scope.pathFiles = [];
  $scope.photos = [];
  $scope.select2Options = {
    'multiple': true,
    'simple_tags': true
  };
  videoService.searchTags({ performerId: performer._id }).then((res) => {
    $scope.listTags = res;
    if ($scope.listTags) {
      $scope.inputSelect2Options = {
        'multiple': true,
        'simple_tags': true,
        tags: $scope.listTags
      }
    } else {
      $scope.inputSelect2Options = {
        'multiple': true,
        'simple_tags': true,
        tags: []
      }
    }
  });
  $scope.dateOptions = {
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };
  $scope.changeSchedule = function () {
    if (!$scope.video.schedule) {
      $scope.video.schedule = new Date();
    }
    $scope.isSchedule = !$scope.isSchedule;
  };

  $scope.fileFullPath;
  $scope.fileTrailerPath;
  $scope.albumOptions = {
    performer: $scope.video.performer,
    photoAlbumId: $scope.video.photoAlbumId
  };

  $scope.submitForm = function (form, file) {
    $scope.albumOptions.upload({
      performerIds: $scope.video.performer,
      type: 'video',
      isActive: $scope.video.schedule,
      name: $scope.video.name
    }, function (err, resp) {
      if (!err && resp) {
        $scope.video.photoAlbumId = resp.albumId;
      }

      var fileFullPath = $scope.fileFullPath;
      var fileTrailerPath = $scope.fileTrailerPath;
      $scope.submitted = true;
      if (form.$valid) {
        if ((file != null && typeof file.size != 'undefined') || (fileFullPath != null && typeof fileFullPath.size != 'undefined')
          || (fileTrailerPath != null && typeof fileTrailerPath.size != 'undefined')) {
          if (!$scope.video.isSaleVideo) {
            $scope.video.price = 0;
          }
          if ($scope.video.isSaleVideo && $scope.video.price <= 0) {
            return growl.error('Price must be greater than 0', { ttl: 3000 });
          }
          Upload.upload({
            url: '/api/v1/videos/' + $scope.video._id,
            method: 'PUT',
            data: $scope.video,
            file: { image: file, fileFullPath: fileFullPath, fileTrailerPath: fileTrailerPath }
          }).then(function (res) {
            growl.success("Updated successfully", { ttl: 3000 });
            $state.go('manager.videos');
          }, function (response) {

          }, function (evt) {
            $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.safeApply();
          });
        } else {
          if (!$scope.video.isSaleVideo) {
            $scope.video.price = 0;
          }
          if ($scope.video.isSaleVideo && $scope.video.price <= 0) {
            return growl.error('Price must be greater than 0', { ttl: 3000 });
          }
          videoService.update($scope.video._id, $scope.video).then(function (res) {
            growl.success("Updated successfully", { ttl: 3000 });
            $state.go('manager.videos');
          });
        }
      }
    });
  };

  function upload(file, fileFullPath, fileTrailerPath) {
    Upload.upload({
      url: '/api/v1/videos',
      method: 'POST',
      data: $scope.video,
      file: { image: file, fileFullPath: fileFullPath, fileTrailerPath: fileTrailerPath }
    }).then(function (response) {
      $timeout(function () {
        if (response) {
          growl.success("Updated successfully", { ttl: 3000 });
          $state.go('manager.videos');
        }
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    }, function (evt) {
      $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      $scope.safeApply();
    });
  }
});
