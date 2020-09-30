angular.module('xMember').controller('PageCtrl', function ($scope, $state, $location, growl, pageService, pages, pageCount) {
  $scope.pages = pages;
  $scope.baseUrl = $location.$$protocol+":"+"//"+$location.$$host+"/";
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
  $scope.totalItems = pageCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.totalItemInPage = 10;
  $scope.delete = function(page,index){
    pageService.delete(page._id).then(function(res){
      if(res){
        $scope.pages.splice(index,true);
        $scope.totalItems = $scope.totalItems-1;
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  }
  $scope.pageChanged = function (currentPage) {
    pageService.findAll('undefined','undefined',$scope.query).then(function(res){
      $scope.totalItems = res.data;
    });
    pageService.findAll($scope.itemsPerPage, currentPage - 1,$scope.query).then(function (data) {
      $scope.pages = data.data;
      $scope.totalItemInPage = ($scope.itemsPerPage * ($scope.currentPage -1)) + data.data.length;
    });
  };

});

angular.module('xMember').controller('PageEditCtrl', function ($scope, $sce, $state, pageService, growl, page, Upload, $timeout) {
  $scope.action = 'Edit';
  $scope.page = page;

  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
      if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/pages/'+$scope.page._id,
                method: 'PUT',
                data: $scope.page,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Updated successfully",{ttl:3000});
                    $state.go('page');
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
                url: '/api/v1/pages/'+$scope.page._id,
                method: 'PUT',
                data: $scope.page,
                file:file
            }).then(function(res){
              if(res){
                growl.success("Updated successfully",{ttl:3000});
                    $state.go('page');
              }
            })
        }

      }
    }

  $state.current['data'] = {
    pageTitle: $scope.page.name,
    metaKeywords: $scope.page.description,
    metaDescription: $scope.page.description
  };

  $scope.ckConfig = {
    extraPlugins: 'html5video,widget,widgetselection,clipboard,lineutils'
  };

  $scope.froalaOptions = {
    events : {
      'froalaEditor.video.inserted': function (e, editor, $img, response) {
        // Video was inserted in the editor.
        console.log(editor, $img, response)
      },
      'froalaEditor.video.replaced': function (e, editor, $img, response) {
        // Video was replaced in the editor
        console.log('replaced')
        console.log(editor, $img, response);
      }
    }
  };
});

angular.module('xMember').controller('PageAddCtrl', function ($scope, $sce, $state, pageService, growl, Upload, $timeout) {
  $scope.action = 'Add';
  $scope.page = {
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
                url: '/api/v1/pages',
                method: 'POST',
                data: $scope.page,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Added successfully",{ttl:3000});
                    $state.go('page');
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
                url: '/api/v1/pages',
                method: 'POST',
                data: $scope.page,
                file:file
            }).then(function(res){
              growl.success("Added successfully",{ttl:3000});
                    $state.go('page');
            });
        }
      }
    }

  $state.current['data'] = {
    pageTitle: $scope.page.name,
    metaKeywords: $scope.page.description,
    metaDescription: $scope.page.description
  };

  $scope.ckConfig = {
    extraPlugins: 'html5video'
  };

  $scope.froalaOptions = {
    events : {
      'froalaEditor.video.inserted': function (e, editor, $img, response) {
        // $($img).find('video').attr('poster', '/assets/default-video.jpg');
        // //check valid
        // function checkValid() {
        //   var video = document.createElement('video');
        //   video.onload = function() {
        //     console.log('111');
        //     $($img).find('video').attr('poster', '');
        //   };
        //
        //   video.onerror = function() {
        //     console.log('error, couldn\'t load');
        //     // don't show video element
        //     setTimeout(checkValid, 5000);
        //   };
        //
        //   video.src = response.link;
        // }
        //
        // if (response.link.indexOf('s3-us-west-1.amazonaws.com') > -1) {
        //   checkValid();
        // }
      }
    }
  };
});


angular.module('xMember').controller('PageViewCtrl', function ($scope, $sce, $state, page) {
  $scope.page = page;
  $state.current['data'] = {
    pageTitle: $scope.page.name,
    metaKeywords: $scope.page.description,
    metaDescription: $scope.page.description
  }
});
