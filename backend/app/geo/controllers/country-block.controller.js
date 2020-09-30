'use strict';

angular.module('xMember').controller('CountryBlockCtrl', function ($scope, growl, geoService, countries) {
  $scope.countries = countries.data;
  $scope.add = function(data) {
    geoService.addCountry(data)
      .then(function() {
        growl.success('Added');
        data.isBlocked = true;
      });
  };

  $scope.remove = function(data) {
    geoService.removeCountry(data.code)
      .then(function () {
        growl.success('Removed');
        data.isBlocked = false;
      });
  };

  $scope.change = function(blocked, data) {
    console.log(blocked, data)
    if (!blocked) {
      $scope.remove(data);
    } else {
      $scope.add(data);
    }
  };
});
