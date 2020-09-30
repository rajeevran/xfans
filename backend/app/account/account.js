'use strict';

angular.module('xMember')
  .config(function($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginController',
        data: {
          pageTitle: 'Login'
        }
      })

      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/package.html',
        controller: 'SignupCtrl',
        resolve: {
        packages: function(memberPackageService){
          return memberPackageService.findAll().then(function(data){
            return data.data;
          });
        }
      }
      })
      .state('package', {
        url: '/package/:id',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupStep2Ctrl'
      })
      .state('payment', {
        url: '/payment/:id',
        templateUrl: 'app/account/signup/payment.html',
        controller: 'SignupStep3Ctrl',
        resolve: {
        packageData: function(memberPackageService,$stateParams){
          return memberPackageService.find($stateParams.id).then(function(data){
            return data.data;
          });
        }
      }
      })
      .state('forgot', {
        url: '/forgot',
        templateUrl: 'app/account/signup/forgot.html',
        controller: 'ForgotCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        authenticate: true
      });
  })
  .run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if (next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  });
