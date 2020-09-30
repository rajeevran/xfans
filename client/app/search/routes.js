'use strict';

angular.module('xMember').config(function($stateProvider) {
  $stateProvider.state('search', {
    url: '/all/search?q&type&categoryId&r&p',
    templateUrl: 'app/search/search.html',
    controller: 'SearchCtrl',
    data: {
      pageTitle: 'Search',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });
});
