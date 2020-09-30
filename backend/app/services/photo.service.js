'use strict';

angular.module('xMember')
  .factory('photoService', function ($http) {
    return {
      findAll: function(limit,offset,query){
        var filter ='';
        if(typeof query!= 'undefined'){
          filter = '&sort='+query.sort+'&order='+query.order+'&keyword='+query.keyword;
        }
        return $http.get('/api/v1/photos?limit='+limit+'&offset='+offset+filter);
      },
      find: function(id){
        return $http.get('/api/v1/photos/'+id);
      },
      getAll: function(){
        return $http.get('/api/v1/photos/all');
      },
      delete: function(id){
        return $http.delete('/api/v1/photos/'+id);
      },
      search: function(params) {
        return $http.get('/api/v1/photos/search', { params: params })
        .then(function(resp) { return resp.data; });
      }
    };
  });
