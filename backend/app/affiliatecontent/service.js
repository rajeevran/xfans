'use strict';

angular.module('xMember').factory('affiliateContentService', function ($http) {
    return {
      search: function(params){
        return $http.get('/api/v1/affiliateContent/search', {params: params}).then(function(resp) { return resp.data; });
      },
      create: function(data){
        return $http.post('/api/v1/affiliateContent', data).then(function(resp) { return resp.data; });
      },
      update: function(id, data){
        return $http.put('/api/v1/affiliateContent/' + id, data).then(function(resp) { return resp.data; });
      },
      delete: function(id){
        return $http.delete('/api/v1/affiliateContent/' + id).then(function(resp) { return resp.data; });
      },
      findOne: function(id){
        return $http.get('/api/v1/affiliateContent/' + id).then(function(resp) { return resp.data; });
      }
    };
  });
