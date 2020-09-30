"use strict";
angular.module('xMember').controller('TopPerformerCtrl', function ($scope, growl, perfomerService) {
  perfomerService.leaderboards({take: 9,page: 1}).then(function(result){
    $scope.topPerformers = result.items;
  });
});
