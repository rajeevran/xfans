"use strict";
angular.module('xMember')
  .factory('userService', function ($http) {
    return {
      forgot: function(email){
        return $http.post('/api/v1/users/forgot',{email:email});
      },
      changePassword(password) {
        return $http.put('/api/v1/users/password', { password }).then(resp => resp.data);
      },
      get: function(){
        return $http.get('/api/v1/users/me');
      },
      downloadVideo: function(video){
        return $http.post('/api/v1/users/download',{video:video});
      },
      favoriteVideo: function(video){
        return $http.post('/api/v1/users/favorite',{video:video});
      },
      removeFavoriteVideo: function(user){
        return $http.put('/api/v1/users/favorite',{user:user});
      },
      watchLaterVideo: function(video){
        return $http.post('/api/v1/users/watch-later',{video:video});
      },
      removeWatchLaterVideo: function(user){
        return $http.put('/api/v1/users/watch-later',{user:user});
      },
      create: function(user){
        return $http.post('/api/v1/users', user);
      }
    };
  });
