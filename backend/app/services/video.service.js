angular.module('xMember')
  .factory('videoService', function ($http) {
    return {
      findAll: function(limit,offset,query){
        var filter ='';
        if(typeof query!= 'undefined'){
          filter = '&sort='+query.sort+'&order='+query.order+'&keyword='+query.keyword+'&type='+query.type;
        }
        return $http.get('/api/v1/videos?limit='+limit+'&offset='+offset+filter);
      },
      findAllByPerformer: function(id,limit){
        return $http.get('/api/v1/videos?type=performer&id='+id+'&limit='+limit);
      },
      findOther: function(id,limit){
        return $http.get('/api/v1/videos?type=other&id='+id+'&limit='+limit);
      },
      getPathFiles: function(){
        return $http.get('/api/v1/videos/folder');
      },
      find: function(id){
        return $http.get('/api/v1/videos/'+id);
      },
      like: function(video){
        return $http.post('/api/v1/videos/like',{id:video._id});
      },
      delete: function(id){
        return $http.delete('/api/v1/videos/'+id);
      },
      checkBuySaleVideo: function(id,params) {
        return $http.get('/api/v1/videos/'+id + '/adminCheckBuy',{params: params}).then(resp => resp.data);
      }
    };
  });
