"use strict";
angular.module('xMember')
  .factory('bannerService', function ($http) {
    return {
      findAll: function(limit,offset){
        return $http.get('/api/v1/banners?status=active&sort=sort&order=1&limit='+limit+'&offset='+offset);
      },
      findAllByType: function(limit,offset,type){
        return $http.get('/api/v1/banners?status=active&sort=sort&order=1&limit='+limit+'&type='+type+'&offset='+offset);
      },
      findAllByPerformer: function(id,limit){
        return $http.get('/api/v1/banners?status=active&type=performer&id='+id+'&limit='+limit);
      },
      findOther: function(id,limit){
        return $http.get('/api/v1/banners?status=active&type=other&id='+id+'&limit='+limit);
      },
      find: function(id){
        return $http.get('/api/v1/banners/'+id);
      }
    };
  });
