'use strict';
angular.module('xMember').controller('ModelsAddCtrl', function ($scope, $state, perfomerService, growl, Upload, $timeout) {
      $scope.performer = {
        name:'',
        sex: 'female',
        imageThumbPath:null,
        imageFullPath:null,
        description:'',
        sort:0,
        status:'active',
        type: 'system'
      };
      $scope.submitForm = function(form,file){
      $scope.submitted = true;
        if (form.$valid) {
          if(file != null && typeof file.size != 'undefined'){
           file.upload = Upload.upload({
                    url: '/api/v1/performers',
                    method: 'POST',
                    data: $scope.performer,
                    file:file
                });
              file.upload.then(function (response) {
                  $timeout(function () {
                      if(response){
                        growl.success("Added successfully",{ttl:3000});
                        $state.go('manager.videosUpload');
                      }
                  });
              }, function (response) {
                  if (response.status > 0)
                      $scope.errorMsg = response.status + ': ' + response.data;
              }, function (evt) {
                  file.progress = Math.min(100, parseInt(100.0 *
                                           evt.loaded / evt.total));
              });
             }else{
               Upload.upload({
                    url: '/api/v1/performers',
                    method: 'POST',
                    data: $scope.performer,
                    file:file
                }).then(function(res){
                  if(res){
                    growl.success("Added successfully",{ttl:3000});
                          $state.go('manager.videosUpload');
                  }
                })
            }
          }
        }
});
