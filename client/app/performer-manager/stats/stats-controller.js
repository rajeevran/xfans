"use strict";
angular.module('xMember').controller('PerformerStatsCtrl', function ($scope, $timeout, $filter, perfomerService, videoService, Auth, currentUser) {
  videoService.getTop({take: 10, page: 1, performerId: currentUser._id}).then((res) => {
    $scope.labels1 = [];
    $scope.VideoViews = [];
    $scope.VideoComments = [];
    $scope.VideoLikes = [];
    $scope.statsVideos = [
      $scope.VideoComments,
      $scope.VideoLikes,
      $scope.VideoViews
    ];
    // Simulate async data update
    $timeout(function () {
      $scope.statsVideos = [
        $scope.VideoViews,
        $scope.VideoComments,
        $scope.VideoLikes
      ];
    }, 3000);
    $scope.videos = res.items;

    angular.forEach($scope.videos, function(item) {
      $scope.labels1.push(item.name);
      $scope.VideoComments.push(item.stats.totalComment);
      $scope.VideoLikes.push(item.stats.totalLike);
      $scope.VideoViews.push(item.stats.totalView);
    });
  })
  $scope.rangeDate = {
        startDate: moment().subtract(6, "days"),
        endDate: moment()
    };
  $scope.today = new Date();
  $scope.today.toLocaleDateString();
  $scope.today1 = new Date($scope.today);
  $scope.today1.setDate($scope.today.getDate() - 6);
  $scope.today1.toLocaleDateString();
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

  $scope.getStats = function() {
    $scope.data1 = [];
    $scope.data2 = [];
    $scope.data3 = [];
    $scope.data4 = [];
    $scope.data = [
       $scope.data3,
       $scope.data1,
       $scope.data4,
       $scope.data2
    ];
    // Simulate async data update
    $timeout(function () {
      $scope.data = [
        $scope.data1,
        $scope.data2,
        $scope.data3,
        $scope.data4
      ];
    }, 3000);
    $scope.labels = [];

    if ($scope.rangeDate) {
      perfomerService.statView({startDate: $scope.rangeDate.startDate._d, endDate: $scope.rangeDate.endDate._d}).then(function(res){
        angular.forEach(res, function(r) {
          r.end = $filter('date')(r.start, 'MM-d-y');
          $scope.data1.push(r.count);
          $scope.labels.push(r.end);
        });
      });

      perfomerService.statSubscriber({startDate: $scope.rangeDate.startDate._d, endDate: $scope.rangeDate.endDate._d}).then(function(res){
        angular.forEach(res, function(r) {
          $scope.data2.push(r.count);
        });
      });

      perfomerService.statComment({startDate: $scope.rangeDate.startDate._d, endDate: $scope.rangeDate.endDate._d}).then(function(res){
        angular.forEach(res, function(r) {
          $scope.data3.push(r.count);
        });
      });

      perfomerService.statLike({startDate: $scope.rangeDate.startDate._d, endDate: $scope.rangeDate.endDate._d}).then(function(res){
        angular.forEach(res, function(r) {
          $scope.data4.push(r.count);
        });
      });
    }
  }
  $scope.getStats();

  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.colors = ['#45b7cd', '#ff6384', '#f98726', '#24f997'];

  $scope.datasetOverride = [
      {
        label: "Views",
        borderWidth: 1,
        type: 'line'
      },
      {
        label: "Subscribers",
        borderWidth: 2,
        // hoverBackgroundColor: "rgba(255,99,132,0.4)",
        // hoverBorderColor: "rgba(255,99,132,1)",
        type: 'bar'
      },
      {
        label: "Comments",
        borderWidth: 1,
        type: 'line'
      },
      {
        label: "Likes",
        borderWidth: 1,
        type: 'line'
      }
    ];

  $scope.datasetOverride1 = [
      {
        label: "Views",
        borderWidth: 1,
        type: 'line'
      },
      {
        label: "Likes",
        borderWidth: 1,
        type: 'line'
      },
      {
        label: "Comments",
        borderWidth: 1,
        type: 'line'
      }

    ];

});
