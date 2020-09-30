(function (angular) {
  'use strict';
  angular.module('xMember').factory('moviesService', moviesService);

  function moviesService($resource) {
    return $resource('/api/v1/videos/:id/:controller', {
      id: '@_id'
    }, {
      findAll: {
        method: 'GET',
        isArray: true
      },
      find: {
        method: 'GET'
      },
      create: {
        method: 'POST'
      },
      update: {
        method: 'PUT'
      },
      remove: {
        method: 'DELETE'
      }
    });

  }
})(angular);
