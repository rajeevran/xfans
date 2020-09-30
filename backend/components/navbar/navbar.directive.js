angular.module('xMember')
  .directive('navbar', function() {
    return {
      templateUrl: 'components/navbar/navbar.html',
      restrict: 'E',
      replace:true,
      controller: 'NavbarController'
    };
  });