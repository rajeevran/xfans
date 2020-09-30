'use strict';

angular.module('xMember')
  .directive('profileMenu', function() {
    return {
      templateUrl: 'components/profile/menu.html',
      restrict: 'E',
      replace:true,
      controller: function($scope, $rootScope, Auth) {
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.getCurrentUser = Auth.getCurrentUser;
        $scope.currentUser = Auth.getCurrentUser();

        if(typeof $scope.currentUser.imageFullPath == 'undefined'){
          $scope.photo = "assets/images/48.jpg";
        }else{
          $scope.photo = $scope.currentUser.imageFullPath;
        }
      }
    };
  });
