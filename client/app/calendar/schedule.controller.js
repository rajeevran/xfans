(function(angular) {
  'use strict';

  angular.module('xMember')
    .controller('ScheduleVideoCtrl', ScheduleVideoCtrl)

  function ScheduleVideoCtrl($scope, $state, $uibModal, $stateParams, $timeout, calendarService, uiCalendarConfig, Auth, performer) {
    $scope.me = performer;
    $scope.uiCalendarConfig = uiCalendarConfig;

    $scope.events = [];
    $scope.eventSources = [$scope.events];
    $scope.updateCalendar = function() {
      $timeout(function() {
        $scope.uiCalendarConfig.calendars.scheduleCalendar.fullCalendar('render');
        $scope.uiCalendarConfig.calendars.scheduleCalendar.fullCalendar('rerenderEvents');
      });
    };

    $scope.refresh = function() {
      var calendar = $scope.uiCalendarConfig.calendars.scheduleCalendar.fullCalendar('getCalendar');
      var view = calendar.view;
      $scope.viewRender(view);
    };

    $scope.viewRender = function(view) {
      calendarService.search({
          performerId: $stateParams.performerId,
          start: view.start.toDate(),
          end: view.end.toDate()
        })
        .then(function(resp) {
          $scope.eventSources[0].splice(0, $scope.eventSources[0].length);
          _.each(resp.data, (event) => {
            event.start = new Date(event.start);
            event.end = new Date(event.end);
            event.title = event.title;
            if (!event.title) {
              event.title = event.name;
            }
            $scope.eventSources[0].push(event);
            $timeout(() => $scope.uiCalendarConfig.calendars.scheduleCalendar.fullCalendar('render'));
          });
        });
    };

    $scope.click = function(item) {
      if (item.type === 'video') {
        $state.go('videoView', {
          alias: item.alias,
          id: item._id
        });
      } else if (item.type === 'event') {
        $uibModal.open({
          templateUrl: 'app/calendar/detail.html',
          size: 'md',
          controller: ['$scope', '$uibModalInstance', 'event', function($scope, $uibModalInstance, item) {
            $scope.event = item;
            $scope.close = function() {
              $uibModalInstance.close();
            };
          }],
          resolve: {
            event() {
              return item;
            }
          }
        });
      }

    };

    $scope.calendarConfig = {
      calendar: {
        height: 600,
        editable: false,
        header: {
          left: 'prev',
          center: 'title',
          right: 'month agendaWeek next'
        },
        viewRender: $scope.viewRender,
        eventClick: $scope.click
      }
    };

  }
})(angular);
