angular.module('xMember').controller('VideoCtrl', function ($scope, $state, $stateParams, growl, moviesService) {
  $scope.videos = [];
  $scope.query = {
   keyword:'',
   type:'',
   sort:'createdAt',
   order:-1
  };

  $scope.maxSize = 10;
  $scope.totalItems = 0;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.totalItemInPage = 10;
  $scope.delete = deleteItem;
  $scope.pageChanged = loadData;

  if($stateParams.type==='schedule'){
    $scope.query.isSchedule = true;
  }

  loadData($scope.currentPage);

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
  });

  function deleteItem(video,index){
    moviesService.remove({id:video._id}).$promise.then(function(res){
      if(res){
        $scope.videos.splice(index,true);
        $scope.totalItems = $scope.totalItems-1;
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  }

  function loadData(currentPage) {
    moviesService.findAll($scope.query).$promise.then(function (data) {
      $scope.totalItems = data.length;
    });
    moviesService.findAll(angular.merge({
      limit:$scope.itemsPerPage,
      offset:currentPage - 1
    }, $scope.query)).$promise
      .then(function (data) {
        $scope.videos = data;
        $scope.totalItemInPage = ($scope.itemsPerPage * ($scope.currentPage - 1)) + data.length;
      });
  }
});

angular.module('xMember').controller('VideoEditCtrl',
  function ($scope, $sce, $state, categories, performers, pathFiles, videoService, growl, video, Upload, $timeout, userService, orderService, $q) {
    $scope.action = 'Edit';
    $scope.video = video;
    $scope.performers = performers;
    $scope.categories = categories;
    $scope.photos = [];
    $scope.pathFiles = pathFiles;
    //get allsubscriber of uploader video
    userService.getSubscribers({performerId: video.user}).then(data => {
      $scope.users = data.data.items;
    });

    $scope.select2Options = {
      'multiple': true,
      'simple_tags': true
    };
    $scope.inputSelect2Options = {
      'multiple': true,
      'simple_tags': true,
      tags: []
    };
    $scope.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      minDate: new Date(),
      startingDay: 1
    };
    if(video.schedule){
      video.schedule = new Date(video.schedule);
    }

    $scope.fileFullPath;
    $scope.fileTrailerPath;
    $scope.albumOptions = {
      performer: video.performer,
      photoAlbumId: video.photoAlbumId
    };
    $scope.submitForm = function(form,file) {
      $scope.albumOptions.upload({
        performerIds: $scope.video.performer,
        type: 'video',
        isActive: $scope.video.schedule,
        name: $scope.video.name
      }, function(err, resp) {
        if (!err && resp) {
          $scope.video.photoAlbumId = resp.albumId;
        }

        var fileFullPath = $scope.fileFullPath;
        var fileTrailerPath = $scope.fileTrailerPath;
        $scope.submitted = true;
        if (form.$valid) {
          if($scope.isFtp){
            fileFullPath = null;
            fileTrailerPath = null;
          }
          if ((file != null && typeof file.size != 'undefined') || (fileFullPath != null && typeof fileFullPath.size != 'undefined')
            || (fileTrailerPath != null && typeof fileTrailerPath.size != 'undefined')) {
            Upload.upload({
              url: '/api/v1/videos/' + $scope.video._id,
              method: 'PUT',
              data: $scope.video,
              file: {image: file, fileFullPath: fileFullPath, fileTrailerPath: fileTrailerPath}
            }).then(function (response) {
              $timeout(function () {
                if (response) {
                  $scope.video.allowViewSaleIds.forEach(function(userId) {
                    videoService.checkBuySaleVideo(video._id, {userId: userId, videoId: video._id}).then(resp => {
                      if (resp.ok === 0) {
                        orderService.create({user: userId, videoId: video._id, description: 'Allow member to view Sale video.',
                        type: 'free_sale_video', price: 0}).then(res => {
                          growl.success('Allow user to view Sale video success.',{ttl:2000});
                          $scope.success = res.data;
                        })
                      }
                    }).catch(err => growl.error(err));
                    $q.all($scope.success).then( function() {
                      growl.success("Updated successfully", {ttl: 3000});
                      $state.go('movies');
                    });
                  });
                }
              });
            }, function (response) {
              if (response.status > 0)
                $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
              $scope.progress = Math.min(100, parseInt(100.0 *
                evt.loaded / evt.total));
            });
          } else {
            Upload.upload({
              url: '/api/v1/videos/' + $scope.video._id,
              method: 'PUT',
              data: $scope.video,
              file: file
            }).then(function (res) {
              if (res) {
                $scope.video.allowViewSaleIds.forEach(function(userId,index ,arr) {
                  videoService.checkBuySaleVideo(video._id, {userId: userId, videoId: video._id}).then(resp => {
                    if (resp.ok === 0) {
                      orderService.create({user: userId, videoId: video._id, description: 'Allow member to view Sale video.',type: 'free_sale_video', price: 0}).then(res => {
                        growl.success('Allow user to view Sale video success.',{ttl:2000});
                        $scope.success = res.data;
                      })
                    }
                  }).catch(err => growl.error(err));
                  $q.all($scope.success).then( function() {
                    growl.success("Updated successfully", {ttl: 3000});
                    $state.go('movies');
                  });
                });
              }
            })
          }
        }
      });
    };

  $state.current['data'] = {
    pageTitle: $scope.video.name,
    metaKeywords: $scope.video.description,
    metaDescription: $scope.video.description
  }
});

angular.module('xMember').controller('VideoAddCtrl',
  function ($scope, $sce, $state, categories, performers, pathFiles, videoService, growl, Upload, $timeout) {
  $scope.action = 'Add';
  $scope.performers = performers;
  $scope.categories = categories;
  $scope.pathFiles = pathFiles;
  $scope.photos = [];
  $scope.select2Options = {
    'multiple': true,
    'simple_tags': true
  };
  $scope.inputSelect2Options = {
    'multiple': true,
    'simple_tags': true,
    tags: []
  };
  $scope.dateOptions = {
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };
  $scope.video = {
    name:'',
    categories:[],
    tags:[],
    type:'upcoming',
    imageThumbPath:null,
    imageFullPath:null,
    price:'',
    description:'',
    sort:0,
    status:'active'
  };

  $scope.fileFullPath;
  $scope.fileTrailerPath;
  $scope.albumOptions = {
    performer: $scope.video.performer,
    photoAlbumId: $scope.video.photoAlbumId
  };

  $scope.submitForm = function(form, file){
    $scope.albumOptions.upload({
      performerIds: $scope.video.performer,
      type: 'video',
      isActive: $scope.video.schedule,
      name: $scope.video.name
    }, function(err, resp) {
      if (!err && resp) {
        $scope.video.photoAlbumId = resp.albumId;
      }

      var fileFullPath = $scope.fileFullPath;
      var fileTrailerPath = $scope.fileTrailerPath;
      $scope.submitted = true;
      if (form.$valid) {
        if($scope.isFtp){
          fileFullPath = null;
          fileTrailerPath = null;
        }

        if((file != null && typeof file.size != 'undefined') || (fileFullPath && fileFullPath.length)
          || (fileTrailerPath != null && typeof fileTrailerPath.size != 'undefined')){
          if(fileFullPath && fileFullPath.length){
            angular.forEach(fileFullPath, function(fileFull){
              upload(file, fileFull, fileTrailerPath);
            });
          }else{
            upload(file, fileFullPath, fileTrailerPath);
          }
        }else{
          Upload.upload({
            url: '/api/v1/videos',
            method: 'POST',
            data: $scope.video,
            file:file
          }).then(function(res){
            growl.success("Added successfully",{ttl:3000});
            $state.go('movies');
          });
        }
      }
    });
  }

  $state.current['data'] = {
    pageTitle: $scope.video.name,
    metaKeywords: $scope.video.description,
    metaDescription: $scope.video.description
  }

  function upload(file, fileFullPath, fileTrailerPath){
    Upload.upload({
      url: '/api/v1/videos',
      method: 'POST',
      data: $scope.video,
      file:{image:file,fileFullPath:fileFullPath,fileTrailerPath:fileTrailerPath}
    }).then(function (response) {
      $timeout(function () {
        if(response){
          growl.success("Added successfully",{ttl:3000});
          $state.go('movies');
        }
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    }, function (evt) {
      $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  }

});


angular.module('xMember').controller('VideoViewCtrl', function ($scope, $sce, $state, video) {
  $scope.video = video;
  $state.current['data'] = {
    pageTitle: $scope.video.name,
    metaKeywords: $scope.video.description,
    metaDescription: $scope.video.description
  }
});
