"use strict";
angular.module('xMember')
    .filter('split', function() {
    return function(input, splitChar, splitIndex) {
        // do some bounds checking here to ensure it has that index
        return input.split(splitChar)[splitIndex];
    }
  })
  .filter('price', function() {
    return function(price) {
      if (!price) {
        return '';
      }
      var formatPrice = price.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        return '$'+formatPrice;
    }
  })
;
