angular.module('xMember').controller('BannerCtrl', function ($scope, $state, growl, bannerService, banners, bannerCount) {
  $scope.banners = banners;
  $scope.query = {
   keyword:'',
   sort:'createdAt',
   order:-1
  };
  //Set up sort Gird
  $(function(){
    $(".dataTables_filter input").keyup(function(e){
      if(e.keyCode ==13){
        $scope.pageChanged(1);
      }
    })
    $(".table-scrollable th").on('click',function(){
      var indexClick = $(this).index();
      $(".table-scrollable th").each(function(index){
          if(index!=indexClick){
            if($(this).hasClass('sorting')){
              $(this).removeClass('sorting_desc');
              $(this).removeClass('sorting_asc');
            }else if($(this).hasClass('sorting_desc')){
              $(this).removeClass('sorting_desc');
              $(this).addClass('sorting');
            }else if($(this).hasClass('sorting_asc')){
              $(this).removeClass('sorting_asc');
              $(this).addClass('sorting');
            }
          }
      });

      if($(this).hasClass('sorting_desc')){
          $(this).removeClass('sorting_desc');
          $(this).addClass('sorting_asc');
          $scope.query.order = 1;
        }else if($(this).hasClass('sorting_asc')){
          $(this).removeClass('sorting_asc');
          $(this).addClass('sorting_desc');
          $scope.query.order = -1;
        }else if($(this).hasClass('sorting')){
          $(this).addClass('sorting_asc');
          $scope.query.order = 1;
        }
        $scope.$apply();
        if(typeof $(this).attr('rel') != 'undefined'){
          $scope.query.sort = $(this).attr('rel');
          $scope.pageChanged(1);
        }
    });
  })
  $scope.maxSize = 10;
  $scope.totalItems = bannerCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.totalItemInPage = 10;
  $scope.delete = function(banner,index){
    bannerService.delete(banner._id).then(function(res){
      if(res){
        $scope.banners.splice(index,true);
        $scope.totalItems = $scope.totalItems-1;
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  }
  $scope.pageChanged = function (currentPage) {
    bannerService.findAll('undefined','undefined',$scope.query).then(function(res){
      $scope.totalItems = res.data;
    });
    bannerService.findAll($scope.itemsPerPage, currentPage - 1,$scope.query).then(function (data) {
      $scope.banners = data.data;
      $scope.totalItemInPage = ($scope.itemsPerPage * ($scope.currentPage -1)) + data.data.length;
    });
  };

});

angular.module('xMember').controller('BannerEditCtrl', function ($scope, $sce, $state, bannerService, growl, banner, Upload, $timeout) {
  $scope.action = 'Edit';
  $scope.banner = banner;


  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
      if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/banners/'+$scope.banner._id,
                method: 'PUT',
                data: $scope.banner,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Updated successfully",{ttl:3000});
                    $state.go('banner');
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
                url: '/api/v1/banners/'+$scope.banner._id,
                method: 'PUT',
                data: $scope.banner,
                file:file
            }).then(function(res){
              if(res){
                growl.success("Updated successfully",{ttl:3000});
                    $state.go('banner');
              }
            })
        }

      }
    }

  $state.current['data'] = {
    pageTitle: $scope.banner.name,
    metaKeywords: $scope.banner.description,
    metaDescription: $scope.banner.description
  }
});

angular.module('xMember').controller('BannerAddCtrl', function ($scope, $sce, $state, bannerService, growl, Upload, $timeout) {
  $scope.action = 'Add';
  $scope.banner = {
    name:'',
    imageThumbPath:null,
    imageFullPath:null,
    description:'',
    sort:0,
    status:'active',
    type: 'top'
  };
  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
         if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/banners',
                method: 'POST',
                data: $scope.banner,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Added successfully",{ttl:3000});
                    $state.go('banner');
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
                url: '/api/v1/banners',
                method: 'POST',
                data: $scope.banner,
                file:file
            }).then(function(res){
              growl.success("Added successfully",{ttl:3000});
                    $state.go('banner');
            });
        }
      }
    }

  $state.current['data'] = {
    pageTitle: $scope.banner.name,
    metaKeywords: $scope.banner.description,
    metaDescription: $scope.banner.description
  }
});


angular.module('xMember').controller('BannerViewCtrl', function ($scope, $sce, $state, banner) {
  $scope.banner = banner;
  $state.current['data'] = {
    pageTitle: $scope.banner.name,
    metaKeywords: $scope.banner.description,
    metaDescription: $scope.banner.description
  }
});
