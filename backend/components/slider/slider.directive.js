'use strict';

angular.module('xMember')
  .directive('slider', function() {
    return {
      templateUrl: 'components/slider/slider.html',
      restrict: 'E',
      replace:true,
      link: function(scope, element) {
        $('.slider-home').slick({
               arrows: false,
               dots: true
           });
        $(document).ready(function () {
            $('.toggle-menu').click(function () {
                $('.menu ul').toggleClass('show-menu');
            });
        });
        
        scope.$on("$destroy",function(){
   
        });
      }
    };
  });
