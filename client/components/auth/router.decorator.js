'use strict';

(function() {

  angular.module('xMember.auth')
    .run(function($rootScope, $state, $cookies, Auth) {
      // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
      $rootScope.$on('$stateChangeStart', function(event, next) {
        let allowUnauthenticatedStates = ['login', 'signup', 'pageView', 'logout', 'signupPerformer', 'home',
         'paymentSuccess', 'contact', 'forgot', 'landing', 'modelView', 'affiliateLogin', 'affiliateContent', 'affiliateModel'];
        //new rules - user must login before do anything
        if (allowUnauthenticatedStates.indexOf(next.name) > -1) {
          return;
        }
        Auth.isLoggedIn(_.noop)
          .then(is => {
            if (is) {
              return;
            }

            event.preventDefault();
            //store redirect url into cookie then redirect user once he login
            // TODO - check here for the page?
            $cookies.put('redirectUrl', window.location.href);
            $state.go('landing');
          });
      });
    });
})();
