"use strict";
angular.module('xMember').controller('StoreCtrl', function ($scope, $state, ngCart, growl, Auth, productService, md5, products, productCount, categories) {
  //ngCart.setTaxRate(0);
  //ngCart.setShipping(0);
  //console.log(ngCart);
  //ngCart.empty()
  $scope.products = products;
  $scope.maxSize = 10;
  $scope.categories = categories.items;
  $scope.totalItems = productCount.count;

  $scope.currentPage = 1;
  $scope.itemsPerPage = 12;
  $scope.pageChanged = function (currentPage) {
    productService.findAll($scope.itemsPerPage, currentPage - 1, {
      categoryId: $state.params.categoryId || ''
    }).then(function (data) {
      $scope.products = data.data;
    });
  };
  $scope.quantity = 1;

  $scope.buy = function(product){
    $scope.exist = false;
     angular.forEach(ngCart.getItems(),function(item){
        if(item._id == product._id){
          growl.error("You have previously added products",{ttl:3000});
          $scope.exist = true;
          return false;
        }
      });
      if(!$scope.exist){
        ngCart.addItem(product._id,product.name,product.price,1,product);
        growl.success("Add product to cart successfully",{ttl:3000});
      }
  }

});

angular.module('xMember').controller('StoreViewCtrl', function ($scope, $sce, Lightbox, ngCart, Auth, growl, md5, $state, product, products) {
  $scope.product = product;
  $scope.products = products;
  $scope.quantity = {value:1};
  $state.current['data'] = {
    pageTitle: $scope.product.name,
    metaKeywords: $scope.product.description,
    metaDescription: $scope.product.description
  }
   $scope.openLightboxModal = function (image) {
    Lightbox.openModal([$scope.product],0);
  };
  $scope.buy = function(product){
    if(product.quantity < $scope.quantity.value){
      growl.error("Product quantity maximum is "+ product.quantity,{ttl:3000});
      return false;
    }
    $scope.exist = false;
     angular.forEach(ngCart.getItems(),function(item){
        if(item._id == product._id){
          growl.error("You have previously added products",{ttl:3000});
          $scope.exist = true;
          return false;
        }
      });
      if(!$scope.exist){

        ngCart.addItem(product._id,product.name,product.price,$scope.quantity.value,product);
        growl.success("Add product to cart successfully",{ttl:3000});
        $state.go('cart');
      }
  }

});

angular.module('xMember').controller('BuySuccessCtrl', function ($scope, $state, ngCart) {
  ngCart.empty();

});

angular.module('xMember').controller('CartCtrl', function ($scope, $rootScope, $state, ngCart, Auth, growl, md5) {
  $scope.showButtonCheckOut = true;
  $scope.items = ngCart.getItems();
  $scope.total = ngCart.totalCost();
  $scope.$on('ngCart:itemRemoved',function(){
    $scope.items = ngCart.getItems();
    $scope.total = ngCart.totalCost();
  });
  $scope.$on('ngCart:change',function(){
    $scope.items = ngCart.getItems();
    $scope.total = ngCart.totalCost();
  });
  $scope.setQuantity = function(item,quantity){
    if(item._data.quantity < quantity){
      growl.error("Product quantity maximum is "+ item._data.quantity,{ttl:3000});
      $scope.showButtonCheckOut = false;
    }else{
      item.setQuantity(quantity);
      $scope.showButtonCheckOut = true;
    }
  }
  $scope.removeCart = function(index){
    ngCart.removeItem(index);
  }
  $scope.checkOut = function(){
    if(!Auth.isLoggedIn()){
      growl.error("Please signup or login before buy product",{ttl:3000});
      $state.go('login');
      return false;
    }
    $scope.user = Auth.getCurrentUser();
    // if(!$scope.user.isBuyProduct){
    //   growl.error("Subscribe this performer to buy his or her products!",{ttl:3000});
    //   $state.go('models');
    //   return false;
    // }
    $state.go('payment', {type: 'product'});

  }

});
