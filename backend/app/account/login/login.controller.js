'use strict';

angular.module('xMember').controller('LoginController', function ($scope, $state, Auth) {
  var windowHeight = $(window).height();
  $('.login-page').css('height', windowHeight);
  $scope.user = {
    email: null,
    password: null,
    rememberMe: null
  };
  $scope.errors = {};
  $scope.submitted = false;
  $scope.Auth = Auth;
  $scope.$state = $state;
  $scope.login = function (form) {
    $scope.submitted = true;
    if (form.$valid) {
      Auth.login($scope.user).then(function () {
        $state.go('dashboard');
      }).catch(function (err) {
        $scope.errors.other = err.message;
      });
    }
  };
});
