'use strict';

angular.module('xMember').controller('PayoutListCtrl', function ($scope, Auth, payoutService, growl) {
  $scope.requests = [];
  $scope.maxSize = 10;
  $scope.totalItems = 10;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.pageChanged = loadData;
  $scope.query = {
   keyword:'',
   sort:'createdAt',
   order: '-'
  };
  $scope.headers = [
    {name: 'Title', sort: 'title', order: ''},
  {name: 'Performer', sort: 'performer', order: ''}, {name: 'Startdate', sort: 'startDate'}, {name: 'Enddate', sort: 'endDate'},
  {name: 'Created At', sort: 'createdAt'}, {name: 'Status', sort: 'status'}, {name: 'Action'}];
  //Set up sort Gir

  loadData($scope.currentPage);

  function loadData(currentPage) {
    payoutService.search({ take: 10, page: currentPage, keyword: $scope.query.keyword, order: $scope.query.order, sort: $scope.query.sort})
    .then(function (result) {
      if (result.items) {
        var data = result.items;
        $scope.requests = data;
      }
        $scope.totalItems = result.count;
    });
  };
  $scope.loadData = loadData;

  $scope.remove = function(requestId,index) {
    // if (!window.confirm('Are you sure you want to delete?')) {
    //   return;
    // }
    payoutService.delete(requestId).then(function(res){
      if(res){
        $scope.requests.splice(index, 1);
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  };

  $scope.sort = function(header){
    if(header.sort === $scope.query.sort){
      if(!$scope.query.order){
        $scope.query.order = '-';
      }
      else{
        $scope.query.order = '';
      }
    }
    else{
      $scope.query.order = '';
    }
    $scope.query.sort = header.sort;

    loadData($scope.currentPage);
  }

});

angular.module('xMember').controller('PayoutEditCtrl', function ($scope, Auth, payoutService, growl, request, $timeout, commentService, comments) {
  $scope.user = Auth.getCurrentUser(null);
  $scope.action = "Edit";
  $scope.request = request;
  $scope.comments = comments;
  $scope.comment = {
    user: $scope.user._id,
    payout: $scope.request._id,
    content: "",
    type: "payout",
    status: "active"
  }

  if($scope.request.startDate){
    $scope.request.startDate = new Date($scope.request.startDate);
  }
  if($scope.request.endDate){
    $scope.request.endDate = new Date($scope.request.endDate);
  }

  $scope.submitForm = function(form){
    $scope.submitted = true;
    if (form.$valid) {
        payoutService.update($scope.request._id, $scope.request).then(function (response) {
          $timeout(function () {
            if (response) {
              growl.success('Updated successfully', {ttl: 3000});
            }
          });
        }, function (response) {
          if (response.status > 0) {
            $scope.errorMsg = response.status + ': ' + response.data;
          }
        });
    }
  };

  $scope.submitComment = function(commentform){
    if(commentform.$valid) {
        commentService.createBy($scope.comment).then(function(item) {
          if(item){
            $scope.comments.unshift(item);
          }
         });
    }
  }
});
