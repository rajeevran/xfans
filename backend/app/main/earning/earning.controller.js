angular.module('xMember').controller('EarningCtrl', function ($scope, $state, growl, earningService, perfomerService) {

  $scope.maxSize = 10;
  $scope.totalItems = 10;
  $scope.itemsPerPage = 10;
  $scope.pageChanged = loadData;
  $scope.today = new Date();
  $scope.performerSelected = null;
  $scope.selectPerformerOptions = {
    debounce: {
      default: 500
    }
  };
  $scope.daterange = {};
  $scope.statsdaterange = {};
  $scope.updatePaiddaterange = {
    dateFrom : null,
    dateTo : null,
    paid : false
  }
  $scope.query = {
    take : 10,
    page: 1,
    dateFrom : null,
    dateTo : null,
    type : "",
    performerId : ""
  };
  loadData($scope.query.page);

  $scope.searchPerformer = function(keyword){
    return perfomerService.search({page: 1, take: 10, keyword : keyword}).then(function(res){
      return $scope.performers = res.items;
    })
  };

  function loadData(currentPage) {
    if($scope.daterange){
      $scope.query.dateFrom = $scope.daterange.startDate ? $scope.daterange.startDate.toDate() : '';
      $scope.query.dateTo = $scope.daterange.endDate ? $scope.daterange.endDate.toDate() : '';
    }
    if($scope.performerSelected){
       $scope.query.performerId = $scope.performerSelected._id;
    } else {
      $scope.query.performerId = "";
    }
    earningService.search($scope.query)
    .then(function (result) {
      if (result.items) {
        var data = result.items;
        $scope.earnings = data;
      }
        $scope.totalItems = result.count;
    });
  };
  $scope.loadData = loadData;

  $scope.statistic = function() {
    earningService.stats().then(function(res) {
      $scope.stats = res;
    })
  };
  $scope.statistic();

  $scope.changePaid = function(){
    if($scope.statsdaterange){
      $scope.updatePaiddaterange.dateFrom = $scope.statsdaterange.startDate;
      $scope.updatePaiddaterange.dateTo = $scope.statsdaterange.endDate;
    }
    earningService.updatePaid($scope.updatePaiddaterange).then(function(res) {
      if(res){
        $state.reload();
        growl.success("Update paid status successfully!",{ttl:3000});
      } else {
        growl.error("Something went wrong, please try again!",{ttl:3000});
      }
    })
  }
});
