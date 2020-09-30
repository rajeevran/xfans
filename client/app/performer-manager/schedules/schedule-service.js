'use strict';

angular.module('xMember').factory('scheduleService', function ($http) {
    return {
      list: function(params){
        return $http.get('/api/v1/calendar/events', { params: params }).then(function(resp) { return resp.data; });
      },
      create: function(data){
        return $http.post('/api/v1/calendar', data).then(function(resp) { return resp.data; });
      },
      update: function(id, data){
        return $http.put('/api/v1/calendar/' + id, data).then(function(resp) { return resp.data; });
      },
      delete: function(id){
        return $http.delete('/api/v1/calendar/' + id).then(function(resp) { return resp.data; });
      },
      findOne: function(id){
        return $http.get('/api/v1/calendar/' + id).then(function(resp) { return resp.data; });
      }
    };
  });
