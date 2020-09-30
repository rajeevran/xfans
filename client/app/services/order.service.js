"use strict";
angular.module('xMember')
  .factory('orderService', function ($http) {
    return {
      findAll: function(limit,offset){        
        return $http.get('/api/v1/orders?limit='+limit+'&offset='+offset+'&status=active');
      },  
      findCountOrder: function(userId){        
        return $http.get('/api/v1/orders?'+'&status=active'+'&userId='+userId);
      },
      find: function(id){        
        return $http.get('/api/v1/orders/'+id);
      }
    };
  });