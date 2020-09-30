'use strict';

angular.module('xMember').controller('RequestPayoutCreateCtrl', function($scope, $state, $timeout, performer, payoutService, growl) {
  $scope.request = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'pending',
    performer: performer
  };
  $scope.altInputFormats = ['M!/d!/yyyy'];
  $scope.format = 'MMMM-dd-yyyy';
  $scope.startDateOptions = {};
  $scope.endDateOptions = {
    minDate: new Date()
  };

  $scope.submitForm = function(form) {
    $scope.submitted = true;
    payoutService.create($scope.request).then(function(response) {
        if (response) {
          growl.success('Created successfully', {
            ttl: 3000
          });
        }
    }, function(response) {
      if (response.status > 0) {
        $scope.errorMsg = response.status + ': ' + response.data;
      }
    });
  };

  $scope.selectedStartDate = function(date) {
    $scope.endDateOptions.minDate = date;
    if ($scope.request.endDate < date) {
      $scope.request.endDate = date;
    }
  }
});
