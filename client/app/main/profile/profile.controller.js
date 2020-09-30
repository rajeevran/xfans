"use strict";
angular.module('xMember').controller('ProfileCtrl', function ($scope, $timeout, $state, Auth, growl, Upload, $stateParams) {
  if(!Auth.isLoggedIn()){
    $state.go('home');
  }
  $scope.getCurrentUser = Auth.getCurrentUser;
  if (typeof $scope.getCurrentUser().photo == 'undefined') {
    $scope.photo = "assets/images/48.jpg";
  } else {
    $scope.photo = $scope.getCurrentUser().photo;
  }

  $scope.currentUser = Auth.getCurrentUser();
  $scope.user = {
    name: $scope.getCurrentUser().name,
    email: $scope.getCurrentUser().email,
    phone: $scope.getCurrentUser().phone,
    photo: $scope.getCurrentUser().photo,
    country: null,
    city: null
  }

  $scope.updateProfile = function(form){
  $scope.submitted = true;
    if (form.$valid) {
      Auth.updateUser($scope.user)
        .then((res) => {
          if(res){
            growl.success("Updated successfully",{ttl:3000});
            $scope.user = res;
          }
        }).catch(err => {
          err = err.data;
          this.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  }

  $scope.uploadFiles = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: '/api/v1/users/photo',
                method: 'POST',
                file: file
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    // $scope.user = response.data;
                    window.location.reload()
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 *
                                         evt.loaded / evt.total));
            });
        }
    }

  $scope.connectTwitter = function() {
    window.location.href = '/api/v1/twitter/connect?access_token=' + Auth.getToken();
  };
});

angular.module('xMember').controller('NotificationCtrl', function ($scope, $timeout, $state, Auth, growl) {
  if(!Auth.isLoggedIn()){
    $state.go('home');
  }
});

angular.module('xMember').controller('FavoriteCtrl', function ($scope, $timeout, $state, videos, videoCount, saveVideoService, videoService, me, Auth, growl, userService) {
  if(!Auth.isLoggedIn()){
    $state.go('home');
  }
  $scope.videos = videos;
  $scope.maxSize = 10;
  $scope.totalItems = videoCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 6;
  $scope.pageChanged = function (currentPage) {
    saveVideoService.findAll('favorites',$scope.itemsPerPage, currentPage - 1).then(function (data) {
      $scope.videos = data.data;
    });
  };

  //Remove
  $scope.remove = function(index,id){
    $scope.videos.splice(index,1);
    saveVideoService.delete(id).then(function(res){
      $state.go('favorites');
          growl.success("Remove favorite video successfully",{ttl:3000});
      },function(error){
        growl.error(error.data.error,{ttl:3000});
      });
  }
});

angular.module('xMember').controller('WatchLaterCtrl', function ($scope, $timeout, $state, me, videos, videoCount, saveVideoService, Auth, growl, userService ) {
  if(!Auth.isLoggedIn()){
    $state.go('home');
  }
  $scope.videos = videos;
  $scope.maxSize = 10;
  $scope.totalItems = videoCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 6;
  $scope.pageChanged = function (currentPage) {
    saveVideoService.findAll('watchlater',$scope.itemsPerPage, currentPage - 1).then(function (data) {
      $scope.videos = data.data;
    });
  };

  //Remove
  $scope.remove = function(index,id){
    $scope.videos.splice(index,1);
    saveVideoService.delete(id).then(function(res){
      $state.go('watchLater');
          growl.success("Remove watch later video successfully",{ttl:3000});
      },function(error){
        growl.error(error.data.error,{ttl:3000});
      });
  }
});

angular.module('xMember').controller('DownloadedCtrl', function ($scope, $rootScope, $timeout, $state, me, Auth, growl) {
  if(!Auth.isLoggedIn()){
    $state.go('home');
  }
  $scope.downloaded = me.downloadedVideo;

  $scope.limit = 6;
  $scope.pager = {};
  $scope.getPager = function (totalItems, currentPage, pageSize) {
    // default to first page
    currentPage = currentPage || 1;

    // default page size is 10
    pageSize = pageSize || $scope.limit;

    // calculate total pages
    var totalPages = Math.ceil(totalItems / pageSize);

    var startPage, endPage;
    if (totalPages <= 10) {
      // less than 10 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // more than 10 total pages so calculate start and end pages
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }

    // calculate start and end item indexes
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = startIndex + pageSize;

    // create an array of pages to ng-repeat in the pager control
    var pages = _.range(startPage, endPage + 1);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }

  $scope.pagerService = function (totalItems, currentPage, pageSize) {
    var service = {};
    service.GetPager = $scope.getPager(totalItems, currentPage, pageSize);
    return service;
  }

  $scope.setPage = function (page) {
    // get pager object from service
    $scope.pager = $scope.pagerService($scope.downloaded.length, page);
    if(page > $scope.pager.GetPager.totalPages){
      $scope.pager.GetPager.currentPage = page-1;
    }
    if (page < 1 || page > $scope.pager.GetPager.totalPages) {
      return;
    }
    // get current page of items
    $scope.items = $scope.downloaded.slice($scope.pager.GetPager.startIndex, $scope.pager.GetPager.endIndex);
    //console.log($scope.items)
  }
  $scope.setPage(1);
});

angular.module('xMember').controller('PurchasedCtrl', function ($scope, $timeout, $state, Auth, growl) {
  if(!Auth.isLoggedIn()){
    $state.go('home');
  }
});

angular.module('xMember').controller('PaymentHistoryCtrl', function ($scope, $timeout, orderService, orders, orderCount, $state, Auth, growl) {
  if(!Auth.isLoggedIn()){
    $state.go('home');
  }
  $scope.user = Auth.getCurrentUser();
  $scope.orders = orders;
  $scope.maxSize = 10;
  $scope.totalItems = orderCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 16;
  $scope.pageChanged = function (currentPage) {
    orderService.findAll($scope.itemsPerPage, currentPage - 1).then(function (data) {
      $scope.orders = data.data;
    });
  };
});

angular.module('xMember').controller('UpdateVipCtrl',
  function ($scope, $rootScope, md5, packages, $state, Auth) {
  if(!Auth.isLoggedIn()){
    $state.go('home');
  }
  $scope.user = Auth.getCurrentUser();
  $scope.packages = packages;
  angular.forEach($scope.packages,function(item){
    var PriceArr = item.price.toString().split('.');
    item['priceArr'] = PriceArr;
    if(typeof PriceArr[1] == 'undefined'){
      PriceArr[1] = '00';
    }
  });

  $scope.selectPlan = function(plan){
    $state.go('payment', {type: 'upgrade', package: plan._id});
  }

});
