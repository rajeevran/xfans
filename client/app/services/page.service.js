"use strict";
angular.module('xMember')
  .factory('pageService', function ($http) {
    return {
      find: function(id){        
        return $http.get('/api/v1/pages/'+id);
      }
    };
  });