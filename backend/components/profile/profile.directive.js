angular.module('xMember')
  .directive('backendMenu', function() {
    return {
      templateUrl: 'components/profile/menu.html',
      restrict: 'E',
      replace:true,
      controller: function($scope, $rootScope, $state, Auth, $stateParams) {
        $scope.active = $state.current.controller;
        $scope.params = $stateParams;
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.getCurrentUser = Auth.getCurrentUser;
        if(typeof $scope.getCurrentUser().photo == 'undefined'){
          $scope.avatar = "assets/images/avatar5.jpg";
        }else{
          $scope.avatar = $scope.getCurrentUser().photo;
        }
        $('.page-sidebar-menu li a').click(function(){
          if($(this).find('.arrow').hasClass('open')){
            $(this).find('.arrow').removeClass('open');
          }else{
            $(this).find('.arrow').addClass('open');
          }
          $(this).parent().find('ul.sub-menu').slideToggle();
        });
      }
    };
  })
 .directive('ckEditor', function () {
  return {
    require: '?ngModel',
    link: function (scope, elm, attr, ngModel) {
      var ck = CKEDITOR.replace(elm[0]);
      if (!ngModel) return;
      ck.on('instanceReady', function () {
        ck.setData(ngModel.$viewValue);
      });
      function updateModel() {
        scope.$apply(function () {
          ngModel.$setViewValue(ck.getData());
        });
      }
      ck.on('change', updateModel);
      ck.on('key', updateModel);
      ck.on('dataReady', updateModel);

      ngModel.$render = function (value) {
        ck.setData(ngModel.$viewValue);
      };
    }
  };
})
.directive('ngConfirmClick', [function() {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
        var msg = attr.ngConfirmClick || "Are you sure?";
        var clickAction = attr.confirmedClick;
        element.bind('click',function (event) {
            if ( window.confirm(msg) ) {
                scope.$eval(clickAction)
            }
        });
    }
	}
}])
;  

