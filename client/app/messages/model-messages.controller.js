(function (angular) {
  'use strict';

  angular.module('xMember').controller('ModelMessagesCtrl', ModelMessagesCtrl);

  function ModelMessagesCtrl($scope, $state, $stateParams, messageService, user) {
    $scope.user = user;
    $scope.groups = [];
    $scope.activeGroup = null;
    messageService.findAllGroups({type: 'model'}).then((res) =>{
      $scope.groups = res;
       if ($scope.groups.length > 0 || $stateParams.recipientId) {
         $scope.activeGroup = _.find($scope.groups, function(group) {
           return _.find(group.users, function(u) {
             return u._id === $stateParams.recipientId;
           });
         });
       }
    });

    $scope.getRecipient = function(group) {
      return _.find(group.users, gUser => gUser._id !== user._id);
    };

    $scope.setActiveGroup = function(group) {
      $scope.activeGroup = group;
    };

  }
})(angular);
