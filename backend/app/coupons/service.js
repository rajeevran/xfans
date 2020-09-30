'use strict';

angular.module('xMember').factory('couponService', function ($http) {
  return {
    find: function(query){
      return $http.get('/api/v1/coupons', { params: query }).then(function(resp) { return resp.data; });
    },
    create: function(data){
      return $http.post('/api/v1/coupons', data).then(function(resp) { return resp.data; });
    },
    update: function(id, data){
      return $http.put('/api/v1/coupons/' + id, data).then(function(resp) { return resp.data; });
    },
    delete: function(id){
      return $http.delete('/api/v1/coupons/' + id).then(function(resp) { return resp.data; });
    },
    findOne: function(id){
      return $http.get('/api/v1/coupons/' + id).then(function(resp) { return resp.data; });
    }
  };
});
