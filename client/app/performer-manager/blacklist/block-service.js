'use strict';

angular.module('xMember').factory('blockService', function ($http) {
    return {
      list: function(params){
        return $http.get('/api/v1/blocks', { params: params }).then( resp => resp.data);
      },
      delete: function(id){
        return $http.delete('/api/v1/blocks/' + id).then( resp => resp.data);
      },
      findOne: function(id){
        return $http.get('/api/v1/blocks/' + id).then( resp => resp.data);
      }
    };
  });
