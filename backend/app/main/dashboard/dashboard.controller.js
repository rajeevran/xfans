angular.module('xMember').controller('DashBoardCrtl', function ($scope, $timeout, $state, Auth, growl, videoCount, performerCount, userCount, orderCount, productCount, albumCount) {
  $scope.videoCount = videoCount;
  $scope.performerCount = performerCount;
  $scope.userCount = userCount;
  $scope.orderCount = orderCount;
  $scope.productCount = productCount.count;
  $scope.albumCount = albumCount.count;
});
