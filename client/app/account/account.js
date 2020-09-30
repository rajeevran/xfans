(function (angular) {
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
        url: '/register/member',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupUserCtrl',
        data: {
          pageTitle: 'Register Member'
        }
      })
      .state('logout', {
        url: '/logout?referrer',
        referrer: 'main',
        template: '',
        controller: function($state, Auth) {
          var referrer = $state.params.referrer || $state.current.referrer || 'main';
          Auth.logout();
          $state.go('landing');
        }
      })
      .state('paymentSuccess', {
        url: '/payment/payment-success',
        templateUrl: 'app/account/signup/success.html',
        controller: 'SignupSuccessCtrl',
        resolve: {

        },
        data: {
          pageTitle: 'Payment success'
        }
      })
      .state('forgot', {
        url: '/account/forgot',
        templateUrl: 'app/account/signup/forgot.html',
        controller: 'ForgotCtrl',
        data: {
          pageTitle: 'Forgot password'
        }
      })
      .state('settings', {
        url: '/account/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsController',
        authenticate: true,
        data: {
          pageTitle: 'Settings'
        }
      })
      .state('signupPerformer', {
        url: '/signup/performer',
        templateUrl: 'app/account/signup/signup-performer.html',
        controller: 'SignupPerformerCtrl',
        data: {
          pageTitle: 'Signup as performer'
        }
      })
  })
  .run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if (next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  });

})(angular);
