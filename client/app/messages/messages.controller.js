(function (angular) {
  'use strict';

  angular.module('xMember').controller('MessagesCtrl', MessagesCtrl);

  function MessagesCtrl($scope, $state, $stateParams, socket, groups, user, messageService, growl) {
    $scope.groups = groups;
    $scope.user = user;

    $scope.activeGroup = null;

    $scope.getRecipient = function(group) {
      return _.find(group.users, gUser => gUser._id !== user._id);
    };

    $scope.setActiveGroup = function(group) {
      $scope.activeGroup = group;
    };

    if ($stateParams.recipientId) {
      $scope.activeGroup = _.find(groups, function(group) {
        return _.find(group.users, function(u) {
          return u._id === $stateParams.recipientId;
        });
      });
    }
  }
})(angular);
