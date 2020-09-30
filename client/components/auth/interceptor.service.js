'use strict';

(function() {

  function authInterceptor($rootScope, $q, $cookies, $injector, Util) {
    var state;
    return {
      // Add authorization token to headers
      request(config) {
        config.headers = config.headers || {};
        if ($cookies.get('token') && Util.isSameOrigin(config.url)) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }
        if ($cookies.get('affiliateToken')) {
          config.headers.Affiliate = 'Bearer ' + $cookies.get('affiliateToken');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError(response) {
        if (response.status === 404) {
          //(state || (state = $injector.get('$state'))).go('home');

          // remove any stale tokens
          //$cookies.remove('token');
        }

        if (response.status === 401) {
          $cookies.remove('token');
          $cookies.remove('affiliateToken');

          if (response.data && response.data.type === 'type' && window.location.pathname !== '/affiliate/login') {
            window.location.href = '/affiliate/login';
          } else {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
        return $q.reject(response);
      }
    };
  }

  angular.module('xMember.auth')
    .factory('authInterceptor', authInterceptor);
})();
