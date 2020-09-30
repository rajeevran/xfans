angular.module('xMember')
    .filter('split', function() {
    return function(input, splitChar, splitIndex) {
        return input.split(splitChar)[splitIndex];
    }
  })
    .filter('price', function() {
    return function(price) {
      var formatPrice = price.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        return '$'+formatPrice;
    }
  })
  .filter('checkMember', function() {
    return function(check) {
      if(check){
        return 'Vip';
      }
      return 'Member'
    }
  })
  .filter('checkBuyProduct', function() {
    return function(check) {
      if(check){
        return 'Yes';
      }
      return 'No'
    }
  })
  .filter('checkImage', function() {
    return function(check) {
      if(typeof(check) == 'undefined' || check== 'null'){
        return '/uploads/noimage.jpg';
      }
      return check;
    }
  }).filter('checkAvatar', function() {
    return function(check) {
      if(typeof(check)== 'undefined'){
        return '/uploads/default.jpg';
      }
      return check;
    }
  })
;
