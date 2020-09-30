angular.module('xMember').controller('SubscriberCtrl', function ($scope, $state, growl, subscriberService, perfomerService) {

  $scope.maxSize = 10;
  $scope.totalItems = 10;
  $scope.itemsPerPage = 10;
  $scope.pageChanged = loadData;
  $scope.performerSelected = null;
  $scope.selectPerformerOptions = {
    debounce: {
      default: 500
    }
  };
  $scope.query = {
    take : 10,
    page: 1,
    performerId : ""
  };
  loadData($scope.query.page);

  $scope.searchPerformer = function(keyword){
    return perfomerService.search({page: 1, take: 10, keyword : keyword}).then(function(res){
      return $scope.performers = res.items;
    })
  };

  function loadData(currentPage) {
    if($scope.performerSelected){
       $scope.query.performerId = $scope.performerSelected._id;
    } else {
      $scope.query.performerId = "";
    }
    subscriberService.search($scope.query)
    .then(function (result) {
      if (result.items) {
        var data = result.items;
        $scope.subscribers = data;
      }
        $scope.totalItems = result.count;
    });
  };
  $scope.loadData = loadData;

});
