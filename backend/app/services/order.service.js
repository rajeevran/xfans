angular.module('xMember')
  .factory('orderService', function ($http) {
    return {
      findAll: function(limit,offset,query){
        var filter ='';
        if(typeof query!= 'undefined'){
          filter = '&sort='+query.sort+'&order='+query.order+'&keyword='+query.keyword+'&type='+query.type+'&performerId='+query.performerId;
        }
        return $http.get('/api/v1/orders?limit='+limit+'&offset='+offset+filter);
      },
      create: function(params) {
        return $http.post('/api/v1/orders/admin', params);
      },
      find: function(id){
        return $http.get('/api/v1/orders/'+id);
      },
      delete: function(id){
        return $http.delete('/api/v1/orders/'+id);
      },
      search: function(params) {
        return $http.get('/api/v1/search/orders', {params: params});
      }
    };
  });
