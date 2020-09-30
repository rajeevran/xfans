angular.module('xMember')
  .directive('footer', function() {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'E',
      replace:true,
      controler: function($scope, Auth) {
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.date = '2016';
        //console.log($scope.date)
      }
    };
  });
