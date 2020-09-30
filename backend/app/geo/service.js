'use strict';

angular.module('xMember').factory('geoService', function ($http) {
  return {
    // languages
    getCountries: function () {
      return $http.get('/api/v1/geo/countries-block');
    },
    removeCountry: function (code) {
      return $http.delete('/api/v1/geo/countries-block/' + code);
    },
    addCountry: function(data) {
      return $http.post('/api/v1/geo/countries-block', data);
    }
  };
});
