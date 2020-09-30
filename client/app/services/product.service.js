"use strict";
angular.module('xMember')
  .factory('productService', function ($http) {
    return {
      findAll: function(limit,offset, params){
        return $http.get('/api/v1/products?limit='+limit+'&offset='+offset+'&status=active', {
          params: params
        });
      },
      findAllByPerformer: function(id,limit){
        return $http.get('/api/v1/products?performerId='+id+'&limit='+limit+'&status=active');
      },
      findOther: function(id,limit){
        return $http.get('/api/v1/products?type=other&id='+id+'&limit='+limit+'&status=active');
      },
      find: function(id){
        return $http.get('/api/v1/products/'+id);
      },
      findCategories: function() {
        return $http.get('/api/v1/product-categories').then(function(resp) {
          return resp.data;
        });
      },
      countAll: function(params){
        return $http.get('/api/v1/products/count', { params }).then(function(resp) { return resp.data; });
      },
      delete: function(id){
        return $http.delete('/api/v1/products/'+id);
      },
      search: function(params){
        return $http.get('/api/v1/products/search/store', {params:params}).then(resp => resp.data);
      }
    };
  });

angular.module('xMember').factory('productCategoryService', function ($http) {
    return {
      find: function(limit,offset,query){
        return $http.get('/api/v1/product-categories').then(function(resp) { return resp.data; });
      },
      findOne: function(id){
        return $http.get('/api/v1/product-categories/' + id).then(function(resp) { return resp.data; });
      }
    };
  });
