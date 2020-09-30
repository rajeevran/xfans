angular.module('xMember').controller('PerforerProductListCtrl', function ($scope, $state, growl, productService, user) {

  $scope.products = [];
  $scope.maxSize = 10;
  $scope.totalItems = 0;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 12;

  $scope.delete = function(product,index) {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    productService.delete(product._id).then(function(res){
      if(res){
        $scope.products.splice(index, 1);
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  };

  $scope.pageChanged = function (currentPage) {
    productService.search({page: currentPage, take: $scope.itemsPerPage, performerId: user._id}).then(function(res){
      $scope.totalItems = res.count;
      $scope.products = res.items;
    });

  };
  $scope.pageChanged(1);
});

angular.module('xMember').controller('PerforerProductEditCtrl', function ($scope, $sce, $state, productService, growl, product, Upload, $timeout, categories) {
  $scope.action = 'Edit';
  $scope.product = product;
  $scope.categories = categories;
  $scope.toggleCategory = function(catId) {
    if (!$scope.product.categoryIds) {
      $scope.product.categoryIds = [];
    }

    if ($scope.product.categoryIds.indexOf(catId) > -1) {
      _.remove($scope.product.categoryIds, function(id) { return id === catId; });
    } else {
      $scope.product.categoryIds.push(catId);
    }
  };

  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
      if(!$scope.product.categoryIds || !$scope.product.categoryIds.length){
        return growl.error('Please select a category!',{ttl:5000});
      }
      if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/products/'+$scope.product._id,
                method: 'PUT',
                data: $scope.product,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Updated successfully",{ttl:3000});
                    $state.go('manager.productList');
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
                url: '/api/v1/products/'+$scope.product._id,
                method: 'PUT',
                data: $scope.product,
                file:file
            }).then(function(res){
              if(res){
                growl.success("Updated successfully",{ttl:3000});
                    $state.go('manager.productList');
              }
            })
        }

      }
    }

  $state.current['data'] = {
    pageTitle: $scope.product.name,
    metaKeywords: $scope.product.description,
    metaDescription: $scope.product.description
  }
});

angular.module('xMember').controller('PerforerProductAddCtrl', function ($scope, $sce, $state, productService, growl, Upload, $timeout, categories) {
  $scope.action = 'Add';
  $scope.product = {
    name:'',
    price:'',
    description:'',
    status:'active',
    categoryIds: [],
    quantity: 0
  };
  $scope.categories = categories;
  $scope.toggleCategory = function(catId) {
    if ($scope.product.categoryIds.indexOf(catId) > -1) {
      _.remove($scope.product.categoryIds, function(id) { return id === catId; });
    } else {
      $scope.product.categoryIds.push(catId);
    }
  };

  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
      if(!$scope.product.categoryIds || !$scope.product.categoryIds.length){
        return growl.error('Please select a category!',{ttl:5000});
      }
      if ($scope.product.quantity === 0) {
        $scope.product.quantity = 9999999999;
      }
         if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/products',
                method: 'POST',
                data: $scope.product,
                file:file
            });
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Added successfully",{ttl:3000});
                    $state.go('manager.productList');
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
                url: '/api/v1/products',
                method: 'POST',
                data: $scope.product,
                file:file
            }).then(function(res){
              growl.success("Added successfully",{ttl:3000});
                    $state.go('manager.productList');
            });
        }
      }
    }

  $state.current['data'] = {
    pageTitle: $scope.product.name,
    metaKeywords: $scope.product.description,
    metaDescription: $scope.product.description
  }
});
