(function (angular) {
  'use strict';

  angular.module('xMember')
    .config(function($stateProvider) {
      $stateProvider
        .state('affiliateLogin', {
          url: '/affiliate/login',
          templateUrl: 'app/affiliate/account/login.html',
          controller: 'LoginAffiliateController',
          resolve: {

          }
        })
        .state('affiliateModel', {
          url: '/affiliate/models',
          templateUrl: 'app/affiliate/list/list-model.html',
          controller: 'AffiliateListModelController',
          resolve: {
          }
        })
        .state('affiliateContent', {
          url: '/affiliate/:performerId/content',
          templateUrl: 'app/affiliate/list/list-content.html',
          controller: 'AffiliateListContentController',
          resolve: {
          }
        });
    });
})(angular);
