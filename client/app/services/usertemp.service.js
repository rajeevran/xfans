"use strict";
angular.module('xMember')
  .factory('usertempService', function ($http) {
    return {
      create: function(user){        
        return $http.post('/api/v1/userTemps',user);
      }, 
      delete: function(id){        
        return $http.delete('/api/v1/userTemps/'+id);
      }
    };
  });