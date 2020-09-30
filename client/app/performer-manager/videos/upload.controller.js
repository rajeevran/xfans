'use strict';

angular.module('xMember').controller('PerformerVideoUploadCtrl', function ($scope, $state, $timeout, photoService, Upload, growl, categories, performer, performers, videoService) {
  $scope.action = 'Add';
  $scope.performers = [];
  $scope.categories = categories;
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
  $scope.video = {
    name: '',
    categories: [],
    tags: [],
    type: 'upcoming',
    imageThumbPath: null,
    imageFullPath: null,
    price: 0,
    description: '',
    sort: 0,
    isSaleVideo: false,
    status: 'inactive',
    performer: [performer._id]
  };
  $scope.isSchedule = false;
  $scope.changeSchedule = function () {
    if (!$scope.video.schedule) {
      $scope.video.schedule = new Date();
    }
    $scope.isSchedule = !$scope.isSchedule;
  };
  $scope.performers = performers;
  $scope.fileFullPath;
  $scope.fileTrailerPath;
  $scope.albumOptions = {
    performer: $scope.video.performer,
    photoAlbumId: $scope.video.photoAlbumId
  };
  $scope.progressPercentage = 0;

  $scope.submitForm = function (form, file) {
    $scope.submitted = true;
    if (!form.$valid) {
      return growl.error('Error, please check!');
    }
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
      if ((file != null && typeof file.size != 'undefined') || (fileFullPath && fileFullPath.length)
        || (fileTrailerPath != null && typeof fileTrailerPath.size != 'undefined')) {
        if (!$scope.video.isSaleVideo) {
          $scope.video.price = 0;
        }
        if ($scope.video.isSaleVideo && $scope.video.price <= 0) {
          return growl.error('Price must be greater than 0', { ttl: 3000 });
        }
        if (fileFullPath && fileFullPath.length) {
          angular.forEach(fileFullPath, function (fileFull) {
            upload(file, fileFull, fileTrailerPath);
          });
        } else {
          upload(file, fileFullPath, fileTrailerPath);
        }
      } else {
        if (!$scope.video.isSaleVideo) {
          $scope.video.price = 0;
        }
        if ($scope.video.isSaleVideo && $scope.video.price <= 0) {
          return growl.error('Price must be greater than 0', { ttl: 3000 });
        }
        Upload.upload({
          url: '/api/v1/videos',
          method: 'POST',
          data: $scope.video,
          file: file
        }).then(function (res) {
          growl.success("Added successfully", { ttl: 3000 });
          $state.go('manager.videos');
        }, function (response) {

        }, function (evt) {
          $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.safeApply();
        });
      }
    });
  }

  function upload(file, fileFullPath, fileTrailerPath) {
    Upload.upload({
      url: '/api/v1/videos',
      method: 'POST',
      data: $scope.video,
      file: { image: file, fileFullPath: fileFullPath, fileTrailerPath: fileTrailerPath }
    }).then(function (response) {
      $timeout(function () {
        if (response) {
          growl.success("Added successfully", { ttl: 3000 });
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
