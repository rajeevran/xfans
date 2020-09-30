'use strict';

angular.module('xMember')
  .directive('movieNew', function() {
    return {
      templateUrl: 'components/movie/movie_new.html',
      restrict: 'E',
      replace:true,
      controller: function($scope, videoService) {
       
        videoService.findAll(8,0).then(function(res){
          $scope.videos = res.data;
        });
        
      }
    };
  })
  .directive('movieRecent', function() {
    return {
      templateUrl: 'components/movie/movie_recent.html',
      restrict: 'E',
      replace:true,
      controller: function($scope, videoService) {
       
        videoService.findAll(12,0).then(function(res){
          $scope.videos = res.data;
        });
        
      }
    };
  });
