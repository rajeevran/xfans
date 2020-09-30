"use strict";
angular.module('xMember')
  .factory('photoService', function ($http) {
    return {
      findAll: function(limit,offset){
        return $http.get('/api/v1/photos?status=active&limit='+limit+'&offset='+offset);
      },
      findAllByPerformer: function(id,limit){
        return $http.get('/api/v1/photos?status=active&type=performer&id='+id+'&limit='+limit);
      },
      findOther: function(id,limit){
        return $http.get('/api/v1/photos?status=active&type=other&id='+id+'&limit='+limit);
      },
      find: function(id){
        return $http.get('/api/v1/photos/'+id);
      },
      findAlbums: function(performerId){
        let params = {
          performerId: performerId
        };
        return $http.get('/api/v1/albums/all', { params: params }).then(function(resp) { return resp.data; });
      },
      findAlbum(id) {
        return $http.get('/api/v1/albums/' + id).then(function(resp) { return resp.data; });
      },
      search: function(params) {
        return $http.get('/api/v1/photos/search', { params: params }).then(function(resp) { return resp.data; });
      },
      delete: function(id){
        return $http.delete('/api/v1/photos/'+id);
      },
      findPerformerAlbums: function(performerId) {
        return $http.get('/api/v1/albums', { params: {
          performerId
        } }).then(function(resp) { return resp.data; });
      }
    };
  });
