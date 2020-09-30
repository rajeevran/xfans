'use strict';

angular.module('xMember')
  .directive('recentModel', function () {
    return {
      templateUrl: 'components/model/recent-model.html',
      restrict: 'E',
      replace: true,
      scope: {
        showHome: '='
      },
      controller: function ($scope, perfomerService, Auth) {
        $scope.model = Auth.getCurrentUser();
        if (!$scope.model) {
          $scope.model._id = '';
        }
        perfomerService.leaderboards({
          take: 10,
          page: 1,
          showHome: $scope.showHome || ''
        }).then(function (result) {
          $scope.performers = result.items.filter(i => i._id !== $scope.model._id);
        });
      }
    };
  });
