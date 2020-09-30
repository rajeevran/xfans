'use strict';

angular.module('xMember').controller('EarningCtrl', function ($scope, Auth, earningService, growl, performer) {
  $scope.performer = performer;
  $scope.maxSize = 10;
  $scope.totalItems = 10;
  $scope.itemsPerPage = 10;
  $scope.today = new Date();
  // set max date range is a week from today
  $scope.week = new Date($scope.today);
  $scope.week.setDate($scope.today.getDate()- 7);
  $scope.week.toLocaleDateString();
  // set max date range is a month from today
  $scope.month = new Date($scope.today);
  $scope.month.setDate($scope.today.getDate()- 30);
  $scope.month.toLocaleDateString();
  // set max date range is a year from today
  $scope.year = new Date($scope.today);
  $scope.year.setDate($scope.today.getDate()- 365);
  $scope.year.toLocaleDateString();
  $scope.daterange = {};
  $scope.query = {
    take : 10,
    page: 1,
    dateFrom : null,
    dateTo : null
  };
  $scope.daterange = {
        startDate: moment().subtract(364, "days"),
        endDate: moment()
  };
  $scope.opts = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "Apply",
            fromLabel: "From",
            format: "YYYY-MM-DD",
            toLabel: "To",
            cancelLabel: 'Cancel'
        },
        ranges: {
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'Last 365 Days': [moment().subtract(364, 'days'), moment()]
        }
    };

  $scope.loadStats = function() {
    if ($scope.daterange.startDate && $scope.daterange.endDate) {
      $scope.daterange.startDate = new Date($scope.daterange.startDate);
      $scope.daterange.endDate = new Date($scope.daterange.endDate);
    }
    earningService.stats({dateFrom: $scope.daterange.startDate, dateTo: $scope.daterange.endDate}).then((resp) => {
      $scope.earningStats = resp;
    });
  };


  $scope.loadData = function(currentPage) {

    if($scope.daterange.startDate && $scope.daterange.endDate) {
      $scope.query.dateFrom = new Date($scope.daterange.startDate);
      $scope.query.dateTo = new Date($scope.daterange.endDate);
    }
    earningService.search($scope.query)
    .then(function (result) {
      if (result.items) {
        var data = result.items;
        $scope.earnings = data;
      }
        $scope.totalItems = result.count;
    });
    $scope.loadStats();
  };
  $scope.loadData($scope.query.page);

});
