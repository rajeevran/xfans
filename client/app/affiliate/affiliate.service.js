"use strict";
angular.module('xMember')
  .factory('affiliateService', function ($http) {
    return {
      search: function(params){
        return $http.get('/api/v1/affiliateContent/search', {params:params}).then((res) => {return res.data});
      },
      findOne: function(id){
        return $http.get('/api/v1/affiliateContent/'+id);
      },
      delete: function(id){
        return $http.delete('/api/v1/affiliateContent/'+id);
      },
      getListPerformer: function(params) {
        return $http.get('/api/v1/affiliateContent/performers', {params: params}).then((res) => {return res.data});
      }
    };
  });
