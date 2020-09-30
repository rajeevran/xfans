'use strict';

angular.module('xMember.auth', ['xMember.constants', 'xMember.util', 'ngCookies',
    'ui.router'
  ])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
