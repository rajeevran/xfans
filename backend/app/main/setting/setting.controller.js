angular.module('xMember').controller('SettingCtrl', function ($scope, $state, growl, settingService, settings, settingCount) {
  $scope.settings = settings;
  $scope.query = {
   keyword:'',
   sort:'createdAt',
   order:-1
  };
   // Editor options.
  $scope.options = {
    language: 'en',
    allowedContent: true,
    entities: false
  };
  //Set up sort Gird
//  $(function(){
//    $(".dataTables_filter input").keyup(function(e){
//      if(e.keyCode ==13){
//        $scope.pageChanged(1);
//      }
//    })
//    $(".table-scrollable th").on('click',function(){
//      var indexClick = $(this).index();
//      $(".table-scrollable th").each(function(index){
//          if(index!=indexClick){
//            if($(this).hasClass('sorting')){
//              $(this).removeClass('sorting_desc');
//              $(this).removeClass('sorting_asc');
//            }else if($(this).hasClass('sorting_desc')){
//              $(this).removeClass('sorting_desc');
//              $(this).addClass('sorting');
//            }else if($(this).hasClass('sorting_asc')){
//              $(this).removeClass('sorting_asc');
//              $(this).addClass('sorting');
//            }
//          }
//      });
//
//      if($(this).hasClass('sorting_desc')){
//          $(this).removeClass('sorting_desc');
//          $(this).addClass('sorting_asc');
//          $scope.query.order = 1;
//        }else if($(this).hasClass('sorting_asc')){
//          $(this).removeClass('sorting_asc');
//          $(this).addClass('sorting_desc');
//          $scope.query.order = -1;
//        }else if($(this).hasClass('sorting')){
//          $(this).addClass('sorting_asc');
//          $scope.query.order = 1;
//        }
//        $scope.$apply();
//        if(typeof $(this).attr('rel') != 'undefined'){
//          $scope.query.sort = $(this).attr('rel');
//          $scope.pageChanged(1);
//        }
//    });
//  })
  $scope.maxSize = 10;
  $scope.totalItems = settingCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.totalItemInPage = 10;
  $scope.delete = function(setting,index){
    settingService.delete(setting._id).then(function(res){
      if(res){
        $scope.settings.splice(index,true);
        $scope.totalItems = $scope.totalItems-1;
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  }
  $scope.pageChanged = function (currentPage) {
    settingService.findAll('undefined','undefined',$scope.query).then(function(res){
      $scope.totalItems = res.data;
    });
    settingService.findAll($scope.itemsPerPage, currentPage - 1,$scope.query).then(function (data) {
      $scope.settings = data.data;
      $scope.totalItemInPage = ($scope.itemsPerPage * ($scope.currentPage -1)) + data.data.length;
    });
  };

});

angular.module('xMember').controller('SettingEditCtrl', function ($scope, $sce, $state, settingService, growl, setting, Upload, $timeout) {
  $scope.action = 'Edit';
  $scope.setting2 = setting;
  $scope.submitForm = function(form,imageHomeFullPath,imageWelcomeFullPath,imageMemberNotVip, imageLogoFullPath, imageLoginFullPath){
  $scope.submitted = true;
    if (form.$valid) {
      if(imageHomeFullPath != null || typeof imageHomeFullPath.size != 'undefined'
              || typeof imageWelcomeFullPath.size != 'undefined'
              || typeof imageMemberNotVip.size != 'undefined'
              || typeof logoFullPath.size != 'undefined'
              || typeof fullAccessVideoTextIcon.size != 'undefined'
              || typeof imageLoginFullPath.size != 'undefined'){
        Upload.upload({
                url: '/api/v1/settings/'+$scope.setting2._id,
                method: 'PUT',
                data: $scope.setting2,
                file: {
                  imageHomeFullPath: imageHomeFullPath,
                  imageWelcomeFullPath: imageWelcomeFullPath,
                  imageMemberNotVip: imageMemberNotVip,
                  logoFullPath: imageLogoFullPath,
                  imageLoginFullPath: imageLoginFullPath,
                  fullAccessVideoTextIcon: $scope.fullAccessVideoTextIcon,
                  favicon: $scope.favicon,
                  videoWatermarkPath: $scope.videoWatermarkPath
                }
            }).then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Updated successfully",{ttl:3000});
                    $state.go('setting');
                  }
              });
          }, function (response) {
              if (response.status > 0)
                  $scope.errorMsg = response.status + ': ' + response.data;
          }, function (evt) {
            $scope.progress = Math.min(100, parseInt(100.0 *
                                     evt.loaded / evt.total));
          });
        }else{
          Upload.upload({
                url: '/api/v1/settings/'+$scope.setting2._id,
                method: 'PUT',
                data: $scope.setting2,
                file:imageHomeFullPath
            }).then(function(res){
              if(res){
                growl.success("Updated successfully",{ttl:3000});
                    $state.go('setting');
              }
            })
        }

      }
    }

  $state.current['data'] = {
    pageTitle: $scope.setting2.name,
    metaKeywords: $scope.setting2.description,
    metaDescription: $scope.setting2.description
  }
});

angular.module('xMember').controller('SettingAddCtrl', function ($scope, $sce, $state, settingService, growl, Upload, $timeout) {
  $scope.action = 'Add';
  $scope.setting = {
    name:'',
    imageThumbPath:null,
    imageFullPath:null,
    description:'',
    sort:0,
    status:'active'
  };
  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
         if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/settings',
                method: 'POST',
                data: $scope.setting,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Added successfully",{ttl:3000});
                    $state.go('setting');
                  }
              });
          }, function (response) {
              if (response.status > 0)
                  $scope.errorMsg = response.status + ': ' + response.data;
          }, function (evt) {
            $scope.progress = Math.min(100, parseInt(100.0 *
                                     evt.loaded / evt.total));
          });
        }else{
          Upload.upload({
                url: '/api/v1/settings',
                method: 'POST',
                data: $scope.setting,
                file:file
            }).then(function(res){
              growl.success("Added successfully",{ttl:3000});
                    $state.go('setting');
            });
        }
      }
    }

  $state.current['data'] = {
    pageTitle: $scope.setting.name,
    metaKeywords: $scope.setting.description,
    metaDescription: $scope.setting.description
  }
});


angular.module('xMember').controller('SettingViewCtrl', function ($scope, $sce, $state, setting) {
  $scope.setting = setting;
  $state.current['data'] = {
    pageTitle: $scope.setting.name,
    metaKeywords: $scope.setting.description,
    metaDescription: $scope.setting.description
  }
});
