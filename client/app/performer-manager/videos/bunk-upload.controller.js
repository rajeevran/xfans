'use strict';

angular.module('xMember').controller('PerformerVideoBunkUploadCtrl', function ($scope, $state, $timeout, photoService, Upload, growl, categories, performer, videoService) {
  $scope.categories = categories;
  $scope.files = [];
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

  $scope.populateFile = function (files) {
    _.map(files, function (file) {
      file.data = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        categories: [],
        tags: [],
        type: 'upcoming',
        imageThumbPath: null,
        imageFullPath: null,
        isSaleVideo: false,
        price: 0,
        description: '',
        sort: 0,
        status: 'inactive',
        performer: [performer._id]
      };
      file.albumOptions = {
        performer: [performer._id],
        photoAlbumId: null
      };
    });
  };

  $scope.remove = function (file, index) {
    $scope.files.splice(index);
  };

  $scope.uploadAll = function () {

    async.eachSeries($scope.files, function (file, cb) {
      async.waterfall([
        function (cb) {
          if (!file.albumOptions.upload) {
            return cb(null, null);
          }
          if (file.data.isSaleVideo && file.data.price <= 0) {
            return growl.error('Price must be greater than 0', { ttl: 3000 });
          }

          file.albumOptions.upload({
            performerIds: file.data.performer,
            name: file.data.name,
            type: 'video'
          }, function (err, resp) {
            cb(null, err || !resp ? null : resp.albumId);
          });
        }
      ], function (err, albumId) {
        if (albumId) {
          file.data.photoAlbumId = albumId;
        }
        var data = file.data;
        var fileTrailerPath = file.data.fileTrailerPath;
        var imageFullPath = file.data.imageFullPath;
        delete file.data.fileTrailerPath;
        delete file.data.imageFullPath;

        file.uploading = true;
        $scope.safeApply();

        Upload.upload({
          url: '/api/v1/videos',
          method: 'POST',
          data: file.data,
          file: {
            image: imageFullPath,
            fileFullPath: file,
            fileTrailerPath: fileTrailerPath
          }
        }).then(function (response) {
          file.uploaded = true;
          file.uploading = false;
          $scope.safeApply();
          cb();
        },
          function () { },
          function (evt) {
            file.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.safeApply();
          });
      });

    }, function () {
      growl.success('Upload done', { ttl: 3000 });
      $state.go('manager.videos');
    });
  };

  $scope.cancel = function () {
    $state.go('manager.videos');
  };
});
