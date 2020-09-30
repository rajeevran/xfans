angular.module('xMember')
  .factory('subscriberService', function ($http) {
    return {
      search: function(params){
        return $http.get('/api/v1/subscribers', {params: params}).then(function(resp){return resp.data});
      },
      create: function(data) {
        return $http.post('/api/v1/subscriptions/add', data ).then(function(resp){return resp.data});
      }
    };
  });
