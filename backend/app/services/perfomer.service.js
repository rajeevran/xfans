angular.module('xMember')
  .factory('perfomerService', function ($http) {
    return {
      findAll: function(limit,offset,query){
        var filter ='';
        if(typeof query!= 'undefined'){
          filter = '&sort='+query.sort+'&order='+query.order+'&keyword='+query.keyword;
        }
        return $http.get('/api/v1/performers?limit='+limit+'&offset='+offset+filter);
      },
      find: function(id){
        return $http.get('/api/v1/performers/admin/'+id);
      },
      delete: function(id){
        return $http.delete('/api/v1/performers/'+id);
      },
      getIdImage: function(id) {
        return $http.get('/api/v1/performers/files/' + id).then(function(resp) {
          return resp.data;
        });
      },
      search: function(params) {
        return $http.get('/api/v1/performers/search', {params: params}).then(function(resp){ return resp.data;})
      }
    };
  });
