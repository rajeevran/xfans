'use strict';

angular.module('xMember').controller('RequestslistCtrl', function ($scope, Auth, payoutService, growl) {
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.performer = {
    _id: $scope.getCurrentUser()._id
  }
  $scope.requests = [];
  $scope.maxSize = 10;
  $scope.totalItems = 10;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.pageChanged = loadData;
  loadData($scope.currentPage);

  function loadData(currentPage) {
    payoutService.search({performerId:$scope.performer._id, take: 10, page: currentPage})
    .then(function (result) {
      if (result.items) {
        var data = result.items;
        $scope.requests = data;
      }
        $scope.totalItems = result.count;
    });
  };

  $scope.remove = function(requestId,index) {
    if (!window.confirm('Are you sure you want to delete?')) {
      return;
    }
    payoutService.delete(requestId).then(function(res){
      if(res){
        $scope.requests.splice(index, 1);
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  };

});
