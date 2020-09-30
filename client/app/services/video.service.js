"use strict";
angular.module('xMember')
  .factory('videoService', function ($resource, $http) {
    var resource = $resource('/api/v1/videos/:id/:controller', {id: '@_id'}, {
      query: {
        method: 'GET',
        isArray:true
      },
      countResult: {
        method: 'GET'
      }
    });

    return {
      query: query,
      countResult: countResult,
      findAllByPerformerSale: function(id, limit,isSale,sortField,orderType){
        var sort = '';
        var order = '';
        if(sortField){
          sort = '&sort='+sortField;
        }
        if(orderType){
          order = '&order='+orderType;
        }
        return $http.get('/api/v1/videos?type=performer&id='+id+'&limit='+limit+'&status=active'+'&isSaleVideo='+ isSale+sort+order);
      },
      findAllByPerformer: function(id, limit, status){
        let statusQuery = status === false ? '' : '&status=active';

        return $http.get('/api/v1/videos?type=performer&id='+id+'&limit='+limit+ statusQuery);
      },
      findOther: function(id,limit){
        return $http.get('/api/v1/videos?type=other&id='+id+'&limit='+limit+'&status=active');
      },
      findAllByType: function(limit,type, sortField, orderType, options){
        var sort = '';
        var order = '';
        if(sortField){
          sort = '&sort='+sortField;
        }
        if(orderType){
          order = '&order='+orderType;
        }
        options = options || {};
        let optionsText = '';
        for (let i in options) {
          optionsText += i + '=' + options[i];
        }
        return $http.get('/api/v1/videos?type='+type+'&limit='+limit+'&status=active'+sort+order + '&' + optionsText);
      },
      findAllByTypeVideo: function(limit,offset,type, sortField, orderType){
        var sort = '';
        var order = '';
        if(sortField){
          sort = '&sort='+sortField;
        }
        if(orderType){
          order = '&order='+orderType;
        }
        return $http.get('/api/v1/videos?type='+type+'&limit='+limit+'&offset='+offset+'&status=active'+sort+order);
      },
      findCountByType: function(type){
        return $http.get('/api/v1/videos?&limit=undefined&type='+type+'&status=active');
      },
      find: function(id){
        return $http.get('/api/v1/videos/'+id);
      },
      showWithUploader: function(id){
        return $http.get('/api/v1/videos/showWithUploader/'+id);
      },
      like: function(video){
        return $http.post('/api/v1/videos/like',{id:video._id});
      },

      search(params) {
        return $http.get('/api/v1/videos/search', { params }).then(resp => resp.data);
      },

      getTop(params) {
        return $http.get('/api/v1/videos/topvideos', { params }).then(resp => resp.data);
      },

      delete: function(id){
        return $http.delete('/api/v1/videos/'+id);
      },

      checkBuySaleVideo: function(id) {
        return $http.get('/api/v1/videos/'+id + '/checkBuy').then(resp => resp.data);
      },

      findOthersByName: function(id, performerId) {
        return $http.get('/api/v1/videos/'+id + '/related?performerId='+performerId).then(resp => resp.data);
      },

      increaseView(id) {
        return $http.put('/api/v1/videos/' + id + '/view').then(resp => resp.data);
      },

      searchTags(params) {
        return $http.get('/api/v1/videos/tags', {params: params}).then(resp => resp.data);
      },

      update(id, data) {
        return $http.put('/api/v1/videos/' + id, data).then(resp => resp.data);
      },

      tweet(id, data) {
        return $http.post('/api/v1/videos/' + id + '/tweet').then(resp => resp.data);
      }

    };

    function query(params){
      return resource.query(params).$promise;
    }

    function countResult(params){
      var query = angular.copy(params);
      query.limit = 'undefined';
      query.offset = 'undefined';
      return resource.countResult(query).$promise;
    }
  });
