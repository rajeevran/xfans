'use strict';

angular.module('xMember')
  .directive('slider', function($timeout, bannerService) {
    return {
      templateUrl: 'components/slider/slider.html',
      restrict: 'E',
      scope: {
        type: '='
      },
      link: function(scope) {
        bannerService.findAllByType(10, 0,scope.type).then(function(res) {
          scope.banners = res.data;
        });
      }
    };
  });
