(function (angular) {
  'use strict';
  angular.module('xMember').factory('categoriesService', categoriesService);

  function categoriesService($resource) {
    return $resource('/api/v1/categories/:id/:controller', {
      id: '@_id'
    }, {
      findAll: {
        method: 'GET',
        isArray:true
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
