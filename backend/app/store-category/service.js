'use strict';

angular.module('xMember').factory('productCategoryService', function ($http) {
    return {
      find: function(limit,offset,query){
        return $http.get('/api/v1/product-categories').then(function(resp) { return resp.data; });
      },
      create: function(data){
        return $http.post('/api/v1/product-categories', data).then(function(resp) { return resp.data; });
      },
      update: function(id, data){
        return $http.put('/api/v1/product-categories/' + id, data).then(function(resp) { return resp.data; });
      },
      delete: function(id){
        return $http.delete('/api/v1/product-categories/' + id).then(function(resp) { return resp.data; });
      },
      findOne: function(id){
        return $http.get('/api/v1/product-categories/' + id).then(function(resp) { return resp.data; });
      }
    };
  });
