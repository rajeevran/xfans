'use strict';

angular.module('xMember').config(function($stateProvider) {
  $stateProvider.state('affiliateAccountCreate', {
    url: '/affiliate/account/create',
    templateUrl: 'app/affiliate-account/views/form.html',
    controller: 'AffiliateAccountCreateCtrl',
    data: {
      pageTitle: 'Create Affiliate Account',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('affiliateAccountListing', {
    url: '/affiliate/account/listing',
    templateUrl: 'app/affiliate-account/views/list.html',
    controller: 'AffiliateAccountListCtrl',
    data: {
      pageTitle: 'Affiliate Account Listing',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('affiliateAccountEdit', {
    url: '/affiliate/account/edit/:id',
    templateUrl: 'app/affiliate-account/views/form.html',
    controller: 'AffiliateAccountEditCtrl',
    resolve: {
      item: function(affiliateService, $stateParams) {
        return affiliateService.findOne($stateParams.id);
      }
    },
    data: {
      pageTitle: 'Update Affiliate Account',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

});
