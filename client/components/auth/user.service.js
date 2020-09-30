'use strict';

(function() {

  function UserResource($resource) {
    return $resource('/api/v1/users/:id/:controller', {
      id: '@_id'
    }, {
      changePassword: {
        method: 'PUT',
        params: {
          controller: 'password'
        }
      },
      updateProfile: {
        method: 'PUT',
        params: {
          controller: 'update-profile'
        }
      },
      get: {
        method: 'GET',
        params: {
          id: 'me'
        }
      },
      loadSubscribed: {
        method: 'GET',
        params: {
          id: 'subscribers',
          controller: 'performers'
        },
        isArray: true
      }
    });
  }

  angular.module('xMember.auth')
    .factory('User', UserResource);
})();
