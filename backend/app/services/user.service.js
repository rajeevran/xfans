angular.module('xMember')
  .factory('userService', function ($http) {
    return {
      forgot: function(email){
        return $http.post('/api/v1/users/forgot',{email:email});
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
      findAll: function(limit,offset,query){
        var filter ='';
        if(typeof query!= 'undefined'){
          filter = '&sort='+query.sort+'&order='+query.order+'&keyword='+query.keyword;
        }
        return $http.get('/api/v1/users?limit='+limit+'&offset='+offset+filter);
      },
      delete: function(id){
        return $http.delete('/api/v1/users/'+id);
      },
      find: function(id){
        return $http.get('/api/v1/users/'+id);
      },
      getSubscribers: function(params) {
        return $http.get('/api/v1/subscribers',params);
      }
    };
  });
