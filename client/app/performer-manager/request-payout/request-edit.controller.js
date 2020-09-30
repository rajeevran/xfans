'use strict';

angular.module('xMember').controller('RequestPayoutEditCtrl', function($scope, $state, $timeout, performer, payoutService, commentService, growl, request, comments) {
  $scope.comments = comments;
  $scope.comment = {
    payout: request._id,
    content: "",
    type: "payout",
    status: "active"
  }
  $scope.altInputFormats = ['M!/d!/yyyy'];
  $scope.format = 'MMMM-dd-yyyy';
  $scope.startDateOptions = {};
  $scope.endDateOptions = {
    minDate: new Date()
  };
  $scope.request = request;
  $scope.request.startDate = new Date($scope.request.startDate);
  $scope.request.endDate = new Date($scope.request.endDate);

  $scope.submitForm = function(form) {
    $scope.submitted = true;
    if (form.$valid) {
      payoutService.update($scope.request._id, $scope.request).then(function(response) {
        $timeout(function() {
          if (response) {
            growl.success('Updated successfully', {
              ttl: 3000
            });
          }
        });
      }, function(response) {
        if (response.status > 0) {
          $scope.errorMsg = response.status + ': ' + response.data;
        }
      });
    }
  };

  $scope.submitComment = function(commentform) {
    if (commentform.$valid) {
      commentService.createBy($scope.comment).then(function(response) {
        $scope.mess = response.data;
        if ($scope.mess) {
          $scope.comments.unshift($scope.mess);
        }
      });
    }
  }

  $scope.selectedStartDate = function(date) {
    $scope.endDateOptions.minDate = date;
    if ($scope.request.endDate < date) {
      $scope.request.endDate = date;
    }
  }

});
