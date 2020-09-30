'use strict';

angular.module('xMember').controller('PhotoBulkUploadCtrl', function ($scope, $state, perfomerService, photoService, albumService, growl, Upload) {
  perfomerService.findAll(200, 0).then(function(data){
    $scope.performers = data.data;
  });
  $scope.fileSelect = [];
  $scope.files = [];
  $scope.albumIds = [];
  $scope.selectedPerformers = [];
  $scope.select2Options = {
    'multiple': true,
    'simple_tags': true
  };
  $scope.performersAlbums = [];

  $scope.populateFile = function(files) {
    _.map(files, function(file) {
      file.data = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        status: 'active',
        performer: $scope.selectedPerformers,
        performerAlbumIds: $scope.albumIds,
        performersAlbums: $scope.performersAlbums
      };
      $scope.files.push(file);
    });
  };

  $scope.remove = function(file, index) {
    $scope.files.splice(index);
  };

  $scope.findAlbums = function(file) {
    var query;
    if (!file) {
      query = { performerId: $scope.selectedPerformers.join(','), take: 200 };
    } else {
      query = { performerId: file.data.performer.join(','), take: 200 };
    }
    albumService.find(query)
    .then(function(resp) {
      if (!file) {
        $scope.performersAlbums = resp.items;
      } else {
        file.data.performersAlbums = resp.items;
      }
    });
  };

  $scope.uploadAll = function() {
    var noPerformer = false;
    _.each($scope.files, function(f) {
      if (!f.data.performer || !f.data.performer.length) {
        noPerformer = true;
        growl.error('Please select model for "' + f.data.name + '"',{ttl:5000});
      }
    });
    if (noPerformer) {
      return;
    }

    $scope.uploading = true;

    async.eachSeries($scope.files, function(file, cb) {
      var data = file.data;
      delete data.performersAlbums;
      file.uploading = true;
      Upload.upload({
        url: '/api/v1/photos',
        method: 'POST',
        data: file.data,
        file: [file]
      }).then(function (response) {
        file.uploaded = true;
        file.uploading = false;
        cb();
      }, function (response) { });
    }, function() {
      growl.success('Upload done', { ttl: 3000 });
      $state.go('photo');
    });
  };

  $scope.cancel = function() {
    $state.go('photo');
  };
});
