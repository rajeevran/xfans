angular.module('xMember')
  .factory('productService', function ($http) {
    return {
      findAll: function(limit,offset,query){
        var filter ='';
        if(typeof query!= 'undefined'){
          filter = '&sort='+query.sort+'&order='+query.order+'&keyword='+query.keyword;
        }
        return $http.get('/api/v1/products?limit='+limit+'&offset='+offset+filter);
      },
      findAllByPerformer: function(id,limit){
        return $http.get('/api/v1/products?type=performer&id='+id+'&limit='+limit);
      },
      findOther: function(id,limit){
        return $http.get('/api/v1/products?type=other&id='+id+'&limit='+limit);
      },
      find: function(id){
        return $http.get('/api/v1/products/'+id);
      },
      delete: function(id){
        return $http.delete('/api/v1/products/'+id);
      },
      countAll: function(){
        return $http.get('/api/v1/products/count').then(function(resp) { return resp.data; });
      }
    };
  });
