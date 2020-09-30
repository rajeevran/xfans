angular
  .module("xMember")
  .controller("NavbarController", function($scope, Auth, settingService) {
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.currentUser = null;
    Auth.getCurrentUser(null).then(function(data) {
      $scope.currentUser = data;
    });

    if (typeof $scope.getCurrentUser(null).photo == "undefined") {
      $scope.avatar = "assets/images/avatar5.jpg";
    } else {
      $scope.avatar = $scope.getCurrentUser(null).photo;
    }
    settingService.getDefault().then(function(data) {
      $scope.setting = data.data;
    });
  });
