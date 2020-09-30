"use strict";
angular.module('xMember').controller('WelcomeCtrl', function ($scope, $state, $rootScope, settingService) {
  settingService.find().then(function(data){
    if (data.data.welcomeTitle) {
      document.title = data.data.welcomeTitle;
    }
  });
});
