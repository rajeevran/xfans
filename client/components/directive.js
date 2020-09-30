'use strict';

angular.module('xMember')
  .directive('myEnter', function() {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
  })
.directive('fallbackSrc', function ($timeout) {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      //do check until link work
      var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

      function doTry() {
        var isS3 = iAttrs.ngSrc ? regex.test(iAttrs.ngSrc) && iAttrs.ngSrc.indexOf('amazonaws.com') > -1 : false;
        if (!isS3) {
          return;
        }
        var imgSrc = iAttrs.ngSrc;
        var img = new Image();
        img.onload = function(){
          iElement.attr("src", imgSrc);
        };
        img.onerror = function() {
          $timeout(doTry, 5000);
        }
        img.src = imgSrc;
      }

      iElement.bind('error', function() {
        var src = iAttrs.fallbackSrc || '/assets/processing.png';
        var elem = angular.element(this);
        elem.attr("src", src);
        doTry();
      });
    }
   }
   return fallbackSrc;
})
.directive('buyProduct', function($state, $, ngCart, growl) {
  return {
    restrict: 'A',
    scope: {
      product: '=buyProduct'
    },
    link(scope, elem) {
      $(elem).click(function() {
        let items = ngCart.getItems();
        if (items.length) {
          if (scope.product.user !== items[0].getData().user) {
            return growl.error("You can shop with one model at a time!", { ttl:3000 });
          }
        }
        let checkOld = _.find(items, i => i._id === scope.product._id);
        if (checkOld) {
          return growl.error("You have previously added products", {ttl:3000 });
        }
        ngCart.addItem(scope.product._id, scope.product.name, scope.product.price, 1, scope.product);
        growl.success("Add product to cart successfully",{ttl:3000});
      });
    }
  };
});
