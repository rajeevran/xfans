'use strict';

angular.module('xMember').controller('BlockListCtrl', function ($scope, $state, growl, blockService, Auth , me) {
  $scope.items = [];

  blockService.list({
    performerId: me._id
  }).then((resp) => {
    $scope.items = resp;
  });

  $scope.delete = function(item, $index) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    blockService.delete(item._id).then(function() {
      $scope.items.splice($index, 1);
    });
  };
});
