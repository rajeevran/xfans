angular.module('xMember')
  .factory('earningService', function ($http) {
    return {
      search: function(params){
        return $http.get('/api/v1/earning/search', {params: params}).then(function(resp) { return resp.data; });
      },
      stats: function(){
        return $http.get('/api/v1/earning/stats').then(function(resp) {return resp.data});
      },
      updatePaid: function(data){
        return $http.put('/api/v1/earning/paid', data).then(function(resp) {return resp.data});
      }
    };
  });
