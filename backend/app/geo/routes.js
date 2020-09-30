'use strict';

angular.module('xMember').config(function ($stateProvider) {
  $stateProvider.state('geoCountries', {
    url: '/geo/countries/block',
    templateUrl: 'app/geo/views/country-block.html',
    controller: 'CountryBlockCtrl',
    data: {
      pageTitle: 'Blocked countries'
    },
    resolve: {
      countries: function(geoService) {
        return geoService.getCountries();
      }
    }
  });
});
