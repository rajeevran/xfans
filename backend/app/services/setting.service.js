angular.module('xMember')
  .factory('settingService', function ($http) {
    return {
      findAll: function(limit,offset,query){  
        var filter ='';
        if(typeof query!= 'undefined'){
          filter = '&sort='+query.sort+'&order='+query.order+'&keyword='+query.keyword;
        }
        return $http.get('/api/v1/settings?limit='+limit+'&offset='+offset+filter);
      },
      find: function(id){        
        return $http.get('/api/v1/settings/'+id);
      },
      getDefault: function(){
        return $http.get('/api/v1/settings/get/full');
      },
      delete: function(id){        
        return $http.delete('/api/v1/settings/'+id);
      }
    };
  });