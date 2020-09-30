"use strict";
angular.module('xMember')
.controller('LoginPerformerController', function ($scope, $state, $window, Auth, growl) {
  $('.login-page').css('height', $(window).height());
  $scope.user = {
    email: null,
    password: null,
    rememberMe: null
  };

  $scope.errors = {};
  $scope.submitted = false;
  $scope.Auth = Auth;
  $scope.$state = $state;

  $scope.login = function(form){
    $scope.submitted = true;

    if (form.$valid) {
     Auth.loginPerformer($scope.user).then(function(res){
       $window.location.href  = '/home';
     }).catch(function(err){
       $scope.errors.other = err.message;
       growl.error('Please check your account, and contact admin if your account is not activated!');
     });
    }
  };
});
