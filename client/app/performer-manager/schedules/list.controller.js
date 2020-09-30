'use strict';

angular.module('xMember').controller('ScheduleListCtrl', function ($scope, $state, $stateParams, growl, scheduleService, me) {
  $scope.items = [];
  $scope.currentUser = me;

  scheduleService.list({
    performerId: $stateParams.performerId
  }).then(function(resp) {
    $scope.items = resp.items;
    $scope.totalItem = resp.count;
  });

  $scope.delete = function(item, $index) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    scheduleService.delete(item._id).then(function() {
      $scope.items.splice($index, 1);
    });
  };
});
