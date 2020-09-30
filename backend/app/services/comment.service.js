angular.module('xMember')
  .factory('commentService', function ($http) {
    return {
      findAll: function(limit,offset){
        return $http.get('/api/v1/comments?limit='+limit+'&offset='+offset);
      },
      findAllByVideo: function(id,limit){
        return $http.get('/api/v1/comments?type=video&id='+id+'&limit='+limit);
      },
      findAllByRequestPayout: function(params){
          return $http.get('/api/v1/comments/search', {params: params}).then(function(resp) { return resp.data; });
      },
      findOther: function(id,limit){
        return $http.get('/api/v1/comments?type=other&id='+id+'&limit='+limit);
      },
      find: function(id){
        return $http.get('/api/v1/comments/'+id);
      },
      create: function(params){
        return $http.post('/api/v1/comments', params).then(function(resp) { return resp.data; });
      },
      createBy: function(params){
        return $http.post('/api/v1/comments/type', params).then(function(resp) { return resp.data; });
      }
    };
  });
