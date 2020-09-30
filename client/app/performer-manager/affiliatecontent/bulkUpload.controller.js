'use strict';

angular.module('xMember').controller('uploadAffiliateContentCtrl', function ($scope, $state, $stateParams, growl, Upload) {

  $scope.files = [];
  $scope.populateFile = function(files) {
    _.map(files, function(file) {
      file.data = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        description: ''
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
            cb(null);
          }
        ], function(err,result) {
          var data = file.data;
          file.uploading = true;
          $scope.safeApply();
          Upload.upload({
            url: '/api/v1/affiliateContent',
            method: 'POST',
            data: file.data,
            file: file
          }).then(function (response) {
            file.uploaded = true;
            file.uploading = false;
            $scope.safeApply();
            cb();
          }, function () {
          },
          function (evt) {
            file.progress = parseInt(100.0 * evt.loaded / evt.total);
            $scope.safeApply();
          });
        });

      },
      function(){
        $scope.uploading = false;
        growl.success('Upload done', { ttl: 3000 });
      });

  };

  $scope.cancel = function() {
    $state.go('manager.profile');
  };
});
