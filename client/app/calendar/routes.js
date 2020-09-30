(function (angular) {
  'use strict';

angular.module('xMember').config(function($stateProvider) {
    $stateProvider.state('calendar', {
      url: '/calendar/:performerId',
      templateUrl: 'app/calendar/calendar.html',
      controller: 'ScheduleVideoCtrl',
      resolve: {
        performer(Auth) {
          return Auth.getCurrentUser();
        }
      }
    });
  });
})(angular);
