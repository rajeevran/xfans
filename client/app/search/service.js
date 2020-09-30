'use strict';

angular.module('xMember')
.factory('searchService', function ($http) {
  return {
    findCategories(type) {
      return $http.get(`/api/v1/search/categories?type=${type}`).then(resp => resp.data);
    },
    findItems(type, params) {
      return $http.get('/api/v1/search', { params }).then(resp => resp.data);
    },
    stats(params) {
      return $http.get('/api/v1/search/stats', { params }).then(resp => resp.data);
    }
  };
});
