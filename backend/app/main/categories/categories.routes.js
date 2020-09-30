(function (angular) {
  'use strict';

  angular.module('xMember')
    .config(categoriesRoute);

  function categoriesRoute($stateProvider) {
    $stateProvider
      .state('main.categories', {
        url: '/categories',
        templateUrl: 'app/main/categories/categories/categories.html',
        controller: 'CategoriesController',
        breadcrumb:{
          name: 'main.categories',
          title: 'Categories'
        }
      })
      .state('main.categoriesAdd', {
        url: '/categories/add',
        templateUrl: 'app/main/categories/partial/form.html',
        controller: 'CategoryCreateController',
        breadcrumb:{
          name: 'main.categories',
          title: 'Categories'
        }
      })
      .state('main.categoriesEdit', {
        url: '/categories/edit/:id',
        templateUrl: 'app/main/categories/partial/form.html',
        controller: 'CategoryUpdateController',
        breadcrumb:{
          name: 'main.categories',
          title: 'Categories'
        },
        resolve: {
          category: getCategory
        }
      });
  }

  function getCategory(categoriesService, $stateParams){
    return categoriesService.find({id:$stateParams.id});
  }
})(angular);
