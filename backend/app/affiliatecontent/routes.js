'use strict';

angular.module('xMember').config(function($stateProvider) {
  $stateProvider.state('affiliateContentCreate', {
    url: '/affiliate/content/create',
    templateUrl: 'app/affiliatecontent/views/form.html',
    controller: 'AffiliateContentCreateCtrl',
    data: {
      pageTitle: 'Upload Affiliate Content',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      models: function(perfomerService) {
        return perfomerService.search();
      }
    }
  });

  $stateProvider.state('affiliateContentBulkUpload', {
    url: '/affiliate/content/bulkupload',
    templateUrl: 'app/affiliatecontent/bulk-upload.html',
    controller: 'AffiliateContentBulkUploadCtrl',
    data: {
      pageTitle: 'Upload Affiliate Content',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      models: function(perfomerService) {
        return perfomerService.search({take: 5000});
      }
    }
  });

  $stateProvider.state('affiliateContentListing', {
    url: '/affiliate/content/listing',
    templateUrl: 'app/affiliatecontent/views/list.html',
    controller: 'AffiliateContentListCtrl',
    data: {
      pageTitle: 'Affiliate Content Listing',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('affiliateContentEdit', {
    url: '/affiliate/content/edit/:id',
    templateUrl: 'app/affiliatecontent/views/form.html',
    controller: 'AffiliateContentEditCtrl',
    resolve: {
      item: function(affiliateContentService, $stateParams) {
        return affiliateContentService.findOne($stateParams.id);
      },
      models: function(perfomerService) {
        return perfomerService.search({take: 5000});
      }
    },
    data: {
      pageTitle: 'Update Affiliate Content',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

});
