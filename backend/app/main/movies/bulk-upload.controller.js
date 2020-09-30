'use strict';

angular.module('xMember').controller('VideoBulkUploadCtrl', function ($scope, $state, perfomerService, photoService, categoriesService, growl, Upload) {
  perfomerService.findAll(200, 0).then(function(data){
    $scope.performers = data.data;
  });
  $scope.categories = categoriesService.findAll();
  $scope.files = [];
  $scope.select2Options = {
    'multiple': true,
    'simple_tags': true
  };
  $scope.inputSelect2Options = {
    'multiple': true,
    'simple_tags': true,
    tags: []
  };

  $scope.populateFile = function(files) {
    _.map(files, function(file) {
      file.data = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        categories: [],
        tags: [],
        type: 'upcoming',
        imageThumbPath: null,
        imageFullPath: null,
        price: '',
        description: '',
        sort: 0,
        status:'inactive'
      };
      file.albumOptions = {
        performer: [],
        photoAlbumId: null
      };
    });
  };

  $scope.remove = function(file, index) {
    $scope.files.splice(index);
  };

  $scope.uploadAll = function() {
    $scope.uploading = true;

    async.eachSeries($scope.files, function(file, cb) {
      async.waterfall([
        function(cb) {
          if (!file.albumOptions.upload) {
            return cb(null, null);
          }

          file.albumOptions.upload({
            performerIds: file.data.performer,
            name: file.data.name,
            type: 'video'
          }, function(err, resp) {
            cb(null, err || !resp ? null : resp.albumId);
          });
        }
      ], function(err, albumId) {
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
          file:{
            image: imageFullPath,
            fileFullPath: file,
            fileTrailerPath: fileTrailerPath
          }
        }).then(function (response) {
          file.uploaded = true;
          file.uploading = false;
          $scope.safeApply();
          cb();
        }, function (response) { });
      });
    }, function() {
      growl.success('Upload done', { ttl: 3000 });
      $state.go('movies');
    });
  };

  $scope.cancel = function() {
    $state.go('movies');
  };
});
