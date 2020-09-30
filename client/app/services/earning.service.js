"use strict";
angular.module('xMember')
.factory('earningService', function ($http) {
  return {
    search: function(params){
      return $http.get('/api/v1/earning/search', {params: params}).then(function(resp) { return resp.data; });
    },
    stats: function(params){
      return $http.get('/api/v1/earning/stats', {params: params}).then(function(resp) { return resp.data; });
    }
  };
});
