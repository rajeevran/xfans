'use strict';
angular.module('xMember').controller('SettingsController', function ($scope, userService, growl) {
  $scope.newPassword = '';
  $scope.rePassword = '';
  $scope.changePassword = function(frm) {
    $scope.submitted = true;
    if (!frm.$valid) {
      return growl.error('Something error, please check');
    }
    if ($scope.newPassword !== $scope.rePassword) {
      return growl.error('Repassword not match');
    }

    userService.changePassword($scope.newPassword)
    .then(() => {
      growl.success('Password has been updatedd', {ttl:2000});
      $scope.newPassword = '';
      $scope.rePassword = '';
      $scope.submitted = false;
    })
  };
});
