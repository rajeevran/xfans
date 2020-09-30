(function (angular) {
  'use strict';

  angular.module('xMember').controller('CategoryUpdateController', CategoryUpdateController);

  function CategoryUpdateController($scope, categoriesService, category, growl, $state) {
    $scope.action = 'Edit';
    $scope.category = category;
    $scope.submitForm = save;

    function save(form){
      if(form.$valid){
        categoriesService.update({id: category._id}, $scope.category).$promise
          .then(function(){
            growl.success("Updated successfully",{ttl:3000});
            $state.go('main.categories');
          }, function(res){
            $scope.errorMsg = res.status + ': ' + (res.data.msg || res.data);
          });
      }
    }
  }

})(angular);
