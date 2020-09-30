"use strict";
angular.module('xMember')
  .factory('commentService', function ($http) {
    return {
      findAll: function(limit,offset){
        return $http.get('/api/v1/comments?status=active&limit='+limit+'&offset='+offset);
      },
      findAllByVideo: function(id,limit){
        return $http.get('/api/v1/comments?status=active&type=video&id='+id+'&limit='+limit);
      },
      findOther: function(id,limit){
        return $http.get('/api/v1/comments?status=active&type=other&id='+id+'&limit='+limit);
      },
      findAllByRequestPayout: function(params){
          return $http.get('/api/v1/comments/search', {params: params}).then(function(resp) { return resp.data; });
      },
      find: function(id){
        return $http.get('/api/v1/comments/'+id);
      },
      create: function(comment){
        return $http.post('/api/v1/comments?type=video',comment);
      },
      createBy: function(comment){
        return $http.post('/api/v1/comments/type',comment);
      },
      delete: function(id){
        return $http.delete('/api/v1/comments/' + id);
      }
    };
  });
