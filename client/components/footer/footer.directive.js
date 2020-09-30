'use strict';

angular.module('xMember')
  .directive('footer', function(appConfig) {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'E',
      replace:true,
      controller: function($scope, Auth, $rootScope) {
        $scope.isLoggedIn = Auth.isLoggedIn;
        // $(document).ready(function () {
        //     $('.toggle-menu').click(function () {
        //         $('.menu ul').toggleClass('show-menu');
        //     });
        // });

        $scope.version = `v${appConfig.version} build ${appConfig.buildNumber}`;
        $scope.showBuild = appConfig.showBuild;
      }
    };
  });
