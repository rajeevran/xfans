"use strict";
angular.module('xMember')
  .factory('payoutService', function ($http) {
    return {
      create: function(params){
        return $http.post('/api/v1/payouts/',params );
      },
      find: function(id){
        return $http.get('/api/v1/payouts/'+id);
      },
      update: function(id, params){
        return $http.put('/api/v1/payouts/'+id, params);
      },
      search: function(params) {
        return $http.get('/api/v1/payouts/search', {params: params}).then(function(resp) { return resp.data; });
      },
      delete: function(id){
        return $http.delete('/api/v1/payouts/'+id);
      }

    };
  });
