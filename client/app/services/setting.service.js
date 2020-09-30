"use strict";
angular.module('xMember')
  .factory('settingService', function ($http) {
    return {
      find: function(id){
        return $http.get('/api/v1/settings/get/full');
      },

      sendContact: function(data) {
        return $http.post('/api/v1/settings/contact', data);
      }
    };
  });
