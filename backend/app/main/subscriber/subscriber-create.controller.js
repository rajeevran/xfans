'use strict';

angular.module('xMember').controller('SubscriberCreateCtrl', function ($scope, $state, growl, subscriberService, perfomerService, userService) {
  $scope.performerSelected = null;
  $scope.userSelected = null;
  $scope.selectPerformerOptions = {
    debounce: {
      default: 500
    }
  };
  $scope.expiredDate = null;

  $scope.searchPerformer = function(keyword){
    return perfomerService.search({page: 1, take: 20, keyword : keyword}).then(function(res){
      return $scope.performers = res.items;
    })
  };
  $scope.searchUser = function(keyword){
    return userService.findAll(20, 0, {sort: 'createAt',order: -1, keyword : keyword}).then(function(res){
      return $scope.users = res.data;
    })
  };

  $scope.submitForm = function() {
    if (!$scope.performerSelected || !$scope.userSelected || !$scope.expiredDate) {
      return growl.error('Invalid form.', {ttl:3000})
    }

    subscriberService.create({userId: $scope.userSelected._id, performerId: $scope.performerSelected._id, expiredDate: $scope.expiredDate}).then((resp)=> {
      growl.success('Success');
      $state.go('subscriber');
    })
    .catch((err) => {
      return growl.error('Something went wrong.',{ttl:3000})
    })
  };

});
