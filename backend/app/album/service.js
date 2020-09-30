'use strict';

angular.module('xMember').factory('albumService', function ($http) {
    return {
      find: function(params){
        return $http.get('/api/v1/albums', { params: params }).then(function(resp) { return resp.data; });
      },
      create: function(data){
        return $http.post('/api/v1/albums', data).then(function(resp) { return resp.data; });
      },
      update: function(id, data){
        return $http.put('/api/v1/albums/' + id, data).then(function(resp) { return resp.data; });
      },
      delete: function(id){
        return $http.delete('/api/v1/albums/' + id).then(function(resp) { return resp.data; });
      },
      findOne: function(id){
        return $http.get('/api/v1/albums/' + id).then(function(resp) { return resp.data; });
      },
      countAll: function(id){
        return $http.get('/api/v1/albums/count').then(function(resp) { return resp.data; });
      }
    };
  });
