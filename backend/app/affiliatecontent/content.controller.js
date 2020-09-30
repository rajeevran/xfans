'use strict';

angular.module('xMember').controller('AffiliateContentCreateCtrl', function ($scope, $state, growl, affiliateContentService, Upload, models, $timeout) {
  $scope.models = models.items;
  $scope.item = {
    name: '',
    description: ''
  };
  $scope.select2Options = {
    'multiple': false,
    'simple_tags': true
  };
  $scope.action = "Create new";

  $scope.submit = function(frm, file) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:5000});
    }

    if (file != null && typeof file.size != 'undefined') {
      Upload.upload({
        url: '/api/v1/affiliateContent',
        method: 'POST',
        data: $scope.item,
        file: file
      }).then(function (response) {
        $timeout(function () {
          if (response) {
            growl.success('Created successfully!', {ttl:3000});
            $state.go('affiliateContentListing');
          }
        });
      }, function (response) {


      }, function (evt) {
        $scope.progress = Math.min(100, parseInt(100.0 *
          evt.loaded / evt.total));
      });
    }else {
      growl.error('File is missing, please try again', {ttl:3000});
    }
  };
});

angular.module('xMember').controller('AffiliateContentEditCtrl', function ($scope, $state, growl, affiliateContentService, item, models) {
  $scope.models = models.items;
  $scope.item = item;
  $scope.action = "Update";
  $scope.select2Options = {
    'multiple': false,
    'simple_tags': true
  };

  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:5000});
    }

    affiliateContentService.update(item._id, $scope.item).then(function(resp) {
      growl.success('Edited successfully!', {ttl:3000});
      $state.go('affiliateContentListing');
    })
    .catch(function() {
      growl.error('Something went wrong, please try to refresh and check again.', {ttl:3000});
    });
  };
});

angular.module('xMember').controller('AffiliateContentListCtrl', function ($scope, $state, growl, affiliateContentService) {
  $scope.items = [];
  $scope.maxSize = 10;
  $scope.totalItems = 10;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 12;
  $scope.filter = {
    performerId: ''
  };

  $scope.query = function(currentPage) {
    affiliateContentService.search(Object.assign({take: $scope.itemsPerPage, page: currentPage},$scope.filter)).then((resp) => {
      $scope.items = resp.items;
      $scope.totalItems = resp.count;
    });
  };

  $scope.query($scope.currentPage);

  $scope.remove = function(itemId, index) {
    if (window.confirm('Confirm to delete this item.')) {
      affiliateContentService.delete(itemId)
      .then((resp) => {
        $scope.items.splice(index,1);
        growl.success('Removed successfully.',{ttl:3000});
      })
    }
  };

  $scope.search = function(performerId) {
    $scope.filter.performerId = performerId;
    $scope.query();
  };
});
