'use strict';

angular.module('xMember')
  .directive('welcome', function() {
    return {
      templateUrl: 'components/welcome/welcome.html',
      restrict: 'E',
      replace:true,
      link: function(scope, element) {
        
        //element.addClass('footer');
      }
    };
  });
