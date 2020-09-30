"use strict";
angular.module('xMember')
  .factory('saveVideoService', function ($http) {
    return {
      findAll: function(type,limit,offset){        
        return $http.get('/api/v1/saveVideos?type='+type+'&limit='+limit+'&offset='+offset);
      },
      findAllByPerformer: function(id,limit){        
        return $http.get('/api/v1/saveVideos?type=performer&id='+id+'&limit='+limit+'&status=active');
      },
      findOther: function(id,limit){        
        return $http.get('/api/v1/saveVideos?type=other&id='+id+'&limit='+limit+'&status=active');
      },
      findAllByType: function(id,limit,type){        
        return $http.get('/api/v1/saveVideos?type='+type+'&id='+id+'&limit='+limit+'&status=active');
      },
      find: function(id){        
        return $http.get('/api/v1/saveVideos/'+id);
      },
      favoriteVideo: function(video){
        return $http.post('/api/v1/saveVideos?type=favorites',video)
      },
      watchlaterVideo: function(video){
        return $http.post('/api/v1/saveVideos?type=watchlater',video)
      },
      delete: function(id){        
        return $http.delete('/api/v1/saveVideos/'+id);
      }
    };
  });