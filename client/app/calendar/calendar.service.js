"use strict";
angular.module('xMember')
  .factory('calendarService', function ($http) {
    return {
      search: function(params){
        return $http.get('/api/v1/calendar',{params: params});
      }
    };
  });
