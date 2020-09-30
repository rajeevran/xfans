(function (angular) {
  'use strict';
  angular.module('xMember').factory('categoriesService', categoriesService);

  function categoriesService($resource) {
    var resource = $resource('/api/v1/categories', {}, {
      findAll: {
        method: 'GET',
        isArray:true
      },
      find: {
        method: 'GET'
      }
    });

    return {
      findAll: findAll,
      findByAlias: findByAlias
    };

    function findAll(params){
      return resource.findAll(params).$promise;
    }

    function findByAlias(alias){
      return resource.findAll({alias: alias}).$promise.then(function(categories){
        if(categories.length>0){
          return categories[0];
        }else{
          return false;
        }
      });
    }
  }
})(angular);
