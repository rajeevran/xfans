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
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError(response) {
        if (response.status === 401) {
          // remove any stale tokens
          $cookies.put('token', undefined, {path: '/'});
          $cookies.put('token', undefined, {path: '/backend'});
          localStorage.removeItem('token');
          (state || (state = $injector.get('$state'))).go('login');
        }
        return $q.reject(response);
      }
    };
  }

  angular.module('xMember.auth')
    .factory('authInterceptor', authInterceptor);
})();
