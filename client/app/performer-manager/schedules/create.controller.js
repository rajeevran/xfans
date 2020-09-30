'use strict';

angular.module('xMember').controller('ScheduleCreateCtrl', function ($scope, $state, growl, scheduleService, me, Auth) {
  $scope.title = 'Create Event';
  $scope.me = me;
  $scope.today = new Date();
  $scope.rangeDate = {
        startDate: moment(),
        endDate: moment().subtract(-1, "days")
  };

  $scope.item = {
    performerId: me._id,
    title: '',
    description: '...'
  };


  $scope.opts = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "Apply",
            fromLabel: "From",
            format: "YYYY-MM-DD",
            toLabel: "To",
            cancelLabel: 'Cancel'
        },
        ranges: {
            'Next 3 Days': [moment().subtract(-2, 'days'), moment()],
            'Next 7 Days': [moment().subtract(-6, 'days'), moment()]
        }
    };

  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:2000});
    }
    scheduleService.create(Object.assign({from: $scope.rangeDate.startDate._d, to: $scope.rangeDate.endDate._d},$scope.item)).then(function(resp) {
      growl.success('Create event successfully.',{ttl:3000});
    })
    .catch(function() {
      growl.error('Something went wrong, please try again.');
    });
  };

  $scope.cancel = function() {
    $state.go('manager.scheduleList', { performerId: me._id});
  };
});
