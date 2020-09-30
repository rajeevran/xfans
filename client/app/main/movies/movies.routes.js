(function (angular) {
  'use strict';

  angular.module('xMember')
    .config(categoriesRoute);

  function categoriesRoute($stateProvider) {
    $stateProvider
      .state('movies', {
        url: '/all/movies?type&category&isSale&performerId',
        templateUrl: 'app/main/movies/movies.html',
        controller: 'MoviesCtrl',
        data: {
          pageTitle: 'Movies',
          metaKeywords: '',
          metaDescription: 'sex, sex tour, video'
        },
        resolve: {
          categories: getCategories
        }
      })
      .state('videoView', {
        url: '/movies/:alias/:id',
        templateUrl: 'app/main/movies/movie-detail.html',
        controller: 'MovieDetailCtrl',
        resolve: {
          video: function(videoService, $stateParams){
            return videoService.find($stateParams.id).then(function(data){
              return data.data;
            });
          },
          settings: function(settingService){
            return settingService.find().then(function(data){
              return data.data;
            });
          },
          comments: function(commentService, $stateParams){
            return commentService.findAllByVideo($stateParams.id,5).then(function(data){
              return data.data;
            });
          },
          me: function(userService){
            return userService.get().then(function(data){
               return data.data;
             });
           }
        }
      });
  }

  function getCategory(categoriesService, $stateParams){
    if($stateParams.category){
      return categoriesService.findByAlias($stateParams.category);
    }
    return true;
  }

  function getCategories(categoriesService){
    return categoriesService.findAll();
  }

})(angular);
