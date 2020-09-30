'use strict';

(function() {

  angular.module('xMember.auth')
    .run(function($rootScope, $state, Auth) {
      // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
      $rootScope.$on('$stateChangeStart', function(event, next) {
        let allowUnauthenticatedStates = [
          'login'
        ];

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
            $state.go('login');
          });
      });
    });
})();
