"use strict";
angular.module('xMember').controller('LoginAffiliateController', function ($scope, $state, Auth) {
  $scope.info = {
    username: null,
    password: null,
    rememberMe: false
  };

  $scope.submitted = false;

  $scope.login = function(form) {
    $scope.submitted = true;
    if (form.$valid) {
      Auth.loginAffiliate($scope.info).then(function(res) {
       $state.go('affiliateModel');
      }).catch(function(err){
       $scope.errors = err;
      });
    }
  };
});
