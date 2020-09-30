angular.module('xMember').controller('OrderCtrl', function ($scope, $state, growl, orderService, orders, models) {
  $scope.orders = orders.items;
  $scope.models = models;
  $scope.select2Options = {
    'multiple': true,
    'simple_tags': true
  };
  $scope.query = {
   keyword:'',
   type:'',
   sort:'createdAt',
   order:-1,
   performerId: ''
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
  $scope.totalItems = orders.count;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 16;
  $scope.totalItemInPage = 16;
  $scope.delete = function(order,index){
    orderService.delete(order._id).then(function(res){
      if(res){
        $scope.orders.splice(index,true);
        $scope.totalItems = $scope.totalItems-1;
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  }
  $scope.pageChanged = function (currentPage) {
    $scope.currentPage = currentPage;
    const params = Object.assign({
      page: currentPage
    }, $scope.query)
    orderService.search(params).then(function (data) {

      $scope.orders = data.data.items;
      $scope.totalItems = data.data.count;
    });
  };

});

angular.module('xMember').controller('OrderEditCtrl', function ($scope, $sce, $state, orderService, growl, order, Upload, $timeout) {
  $scope.action = 'Edit';
  $scope.order = order;
  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
      if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/orders/'+$scope.order._id,
                method: 'PUT',
                data: $scope.order,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Updated successfully",{ttl:3000});
                    $state.go('order');
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
                url: '/api/v1/orders/'+$scope.order._id,
                method: 'PUT',
                data: $scope.order,
                file:file
            }).then(function(res){
              if(res){
                growl.success("Updated successfully",{ttl:3000});
                    $state.go('order');
              }
            })
        }

      }
    }

  $state.current['data'] = {
    pageTitle: $scope.order.name,
    metaKeywords: $scope.order.description,
    metaDescription: $scope.order.description
  }
});

angular.module('xMember').controller('OrderAddCtrl', function ($scope, $sce, $state, orderService, growl, Upload, $timeout) {
  $scope.action = 'Add';
  $scope.order = {
    type:'model',
    imageThumbPath:null,
    imageFullPath:null,
    price:'',
    description:'',
    sort:0,
    status:'active'
  };
  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
         if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/orders',
                method: 'POST',
                data: $scope.order,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Added successfully",{ttl:3000});
                    $state.go('order');
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
                url: '/api/v1/orders',
                method: 'POST',
                data: $scope.order,
                file:file
            }).then(function(res){
              growl.success("Added successfully",{ttl:3000});
                    $state.go('order');
            });
        }
      }
    }

  $state.current['data'] = {
    pageTitle: $scope.order.name,
    metaKeywords: $scope.order.description,
    metaDescription: $scope.order.description
  }
});


angular.module('xMember').controller('OrderViewCtrl', function ($scope, $sce, $state, order) {
  $scope.order = order;
  $state.current['data'] = {
    pageTitle: $scope.order.name,
    metaKeywords: $scope.order.description,
    metaDescription: $scope.order.description
  }
});
