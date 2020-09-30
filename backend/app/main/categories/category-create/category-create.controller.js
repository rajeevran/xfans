(function (angular) {
  'use strict';

  angular.module('xMember').controller('CategoryCreateController', CategoryCreateController);

  function CategoryCreateController($scope, categoriesService, growl, $state) {
    $scope.action = 'Add';
    $scope.category = {
      name:'',
      status:'active'
    };
    $scope.submitForm = save;

    function save(form){
      if(form.$valid){
        categoriesService.create($scope.category).$promise
          .then(function(){
            growl.success("Added successfully",{ttl:3000});
            $state.go('main.categories');
          }, function(res) {
            $scope.errorMsg = res.status + ': ' + (res.data.msg || res.data);
          });
      }
    }
  }

})(angular);
