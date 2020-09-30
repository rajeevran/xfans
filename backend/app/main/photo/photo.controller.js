angular.module('xMember').controller('PhotoCtrl', function ($scope, $state, growl, photoService, photos, photoCount) {
  $scope.photos = photos;
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
  $scope.totalItems = photoCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.totalItemInPage = 10;
  $scope.delete = function(photo,index){
    photoService.delete(photo._id).then(function(res){
      if(res){
        $scope.photos.splice(index,true);
        $scope.totalItems = $scope.totalItems-1;
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  }
  $scope.pageChanged = function (currentPage) {
    photoService.findAll('undefined','undefined',$scope.query).then(function(res){
      $scope.totalItems = res.data;
    });
    photoService.findAll($scope.itemsPerPage, currentPage - 1,$scope.query).then(function (data) {
      $scope.photos = data.data;
      $scope.totalItemInPage = ($scope.itemsPerPage * ($scope.currentPage -1)) + data.data.length;
    });
  };

});

angular.module('xMember').controller('PhotoEditCtrl', function ($scope, $sce, $state, performers, photoService, albumService, growl, photo, Upload, $timeout) {

  $scope.action = 'Edit';
  $scope.photo = photo;
  $scope.performers = performers;
  $scope.select2Options = {
    'multiple': true,
    'simple_tags': true
  };

  $scope.submitForm = function(form, files){
    $scope.submitted = true;
    if (form.$valid) {
      Upload.upload({
        url: '/api/v1/photos/'+$scope.photo._id,
        method: 'PUT',
        data: $scope.photo,
        file: files
      }).then(function (response) {
        $timeout(function () {
          if (response) {
            growl.success("Updated successfully", {ttl: 3000});
            $state.go('photo');
          }
        });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      });
    }
  };

  $scope.$watch('photo.performer', function(nv) {
    if (nv) {
      albumService.find({ performerId: nv.join(','), take: 200 })
      .then(function(resp) {
        $scope.albums = resp.items;
      });
    }
  }, true);
});

angular.module('xMember').controller('PhotoAddCtrl', function ($scope, $sce, $state, performers, photoService, albumService, growl, Upload, $timeout) {
  $scope.action = 'Add';
  $scope.performers = performers;
  $scope.photo = {
    name:'',
    imageThumbPath:null,
    imageFullPath:null,
    description:'',
    sort:0,
    status:'active'
  };
  $scope.select2Options = {
    multiple: true,
    allowClear:true
  };

  $scope.submitForm = function(form, files){
    $scope.submitted = true;
    if (form.$valid) {
        Upload.upload({
          url: '/api/v1/photos',
          method: 'POST',
          data: $scope.photo,
          file: files
        }).then(function (response) {
          $timeout(function () {
            if (response) {
              growl.success("Added successfully", {ttl: 3000});
              $state.go('photo');
            }
          });
        }, function (response) {
          if (response.status > 0)
            $scope.errorMsg = response.status + ': ' + response.data;
        });
    }
  };

  $scope.$watch('photo.performer', function(nv) {
    if (nv) {
      albumService.find({ performerId: nv.join(','), take: 200 })
      .then(function(resp) {
        $scope.albums = resp.items;
      });
    }
  }, true);
});


angular.module('xMember').controller('PhotoViewCtrl', function ($scope, $sce, $state, photo) {
  $scope.photo = photo;
  $state.current['data'] = {
    pageTitle: $scope.photo.name,
    metaKeywords: $scope.photo.description,
    metaDescription: $scope.photo.description
  }
});
