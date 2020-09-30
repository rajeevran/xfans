"use strict";
angular.module('xMember')
  .factory('perfomerService', function ($http) {
    return {
      findAll: function (options) {
        //limit,offset, sortField, orderType
        var sort = '';
        var order = '';
        if (options.sortField) {
          sort = '&sort=' + options.sortField;
        }

        if (options.orderType) {
          order = '&order=' + options.orderType;
        }
        return $http.get('/api/v1/performers?limit=' + options.limit + '&offset=' + options.offset + '&status=active' + sort + order, {
          params: {
            keyword: options.keyword || '',
            size: options.size || '',
            sex: options.sex || ''
          }
        });
      },
      find: function (id) {
        return $http.get('/api/v1/performers/' + id);
      },
      search(params) {
        return $http.get('/api/v1/performers/search', {
          params
        }).then(resp => resp.data);
      },
      changePassword(password) {
        return $http.put('/api/v1/performers/password', {
          password
        }).then(resp => resp.data);
      },
      subsciptionsCount(id) {
        return $http.get('/api/v1/subscriptions/subscribers/count/' + id).then(resp => resp.data);
      },
      checkSubscribe(id) {
        return $http.get('/api/v1/subscriptions/check/' + id).then(resp => resp.data);
      },
      addView(id) {
        return $http.put('/api/v1/performers/' + id + '/view').then(resp => resp.data);
      },
      leaderboards(params) {
        return $http.get('/api/v1/performers/leaderboards?sort=totalSubscriber', {
          params
        }).then(resp => resp.data);
      },
      getIdImage: function (id) {
        return $http.get('/api/v1/performers/files/' + id).then(function (resp) {
          return resp.data;
        });
      },
      statView: function (params) {
        return $http.get('/api/v1/stats/profile-view', {
          params: params
        }).then(function (resp) {
          return resp.data;
        });
      },
      statSubscriber: function (params) {
        return $http.get('/api/v1/stats/subscribers', {
          params: params
        }).then(function (resp) {
          return resp.data;
        });
      },
      statComment: function (params) {
        return $http.get('/api/v1/stats/comments', {
          params: params
        }).then(function (resp) {
          return resp.data;
        });
      },
      statLike: function (params) {
        return $http.get('/api/v1/stats/like', {
          params: params
        }).then(function (resp) {
          return resp.data;
        });
      },
      statEarning: function () {
        return $http.get('/api/v1/earning/stats').then(function (resp) {
          return resp.data;
        });
      },
      checkAllowViewProfile: function (params) {
        return $http.get('/api/v1/performers/check/allow', {
          params: params
        }).then((resp) => resp.data);
      },
      checkBlock(params) {
        return $http.get('/api/v1/blocks/check', {
          params
        }).then(resp => resp.data);
      },
    }
  });
