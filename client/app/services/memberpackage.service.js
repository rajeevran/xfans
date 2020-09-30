"use strict";
angular.module('xMember')
  .factory('memberPackageService', function ($http) {
    return {
      findAll: function(){
        return $http.get('/api/v1/memberShipPackages?status=active');
      },
      find: function(id){
        return $http.get('/api/v1/memberShipPackages/'+id);
      }
    };
  });
