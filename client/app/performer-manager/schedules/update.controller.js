'use strict';

angular.module('xMember').controller('ScheduleUpdateCtrl', function ($scope, $state, growl, scheduleService, me , scheduleItem) {
  $scope.title = 'Update Event';
  $scope.item = scheduleItem;
  $scope.rangeDate = {
    startDate : new Date(scheduleItem.from),
    endDate : new Date(scheduleItem.to)
  };
  $scope.submit = function(frm) {
    if (frm.$invalid) {
      return growl.error('Please check required fields!',{ttl:3000});
    }

    scheduleService.update($scope.item._id,Object.assign( $scope.item, {
      from : $scope.rangeDate.startDate,
      to : $scope.rangeDate.endDate
    })).then( () => {
      growl.success('Updated successfully.',{ttl:3000});
    })
    .catch(function() {
      growl.success('Something went wrong, please try  again!',{ ttl:3000 });
    });
  };

  $scope.cancel = function() {
    $state.go('manager.scheduleList', { performerId: me._id });
  };
});
