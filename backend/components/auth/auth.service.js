'use strict';

(function() {

  function AuthService($location, $http, $cookies, $q, appConfig, Util, User, $state) {
    var safeCb = Util.safeCb;
    var currentUser = {};
    var userRoles = appConfig.userRoles || [];

    if(localStorage.getItem('token')){
      $cookies.put('token', localStorage.getItem('token'));
    }

    var Auth = {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional, function(error, user)
       * @return {Promise}
       */
      login({
        email,
        password,
        rememberMe
      }, callback) {
        return $http.post('/auth/local', {
            email: email,
            password: password
          })
          .then(res => {
            if(rememberMe){
             localStorage.setItem('token', res.data.token);
            }
            $cookies.put('token', res.data.token);
            currentUser = User.get();
            return currentUser.$promise;
          })
          .then(user => {
            if (user.role !== 'admin') {
              return $q.reject({
                data: {
                  message: 'You do not have permission to login to this page!'
                }
              });
            }

            safeCb(callback)(null, user);
            return user;
          })
          .catch(err => {
            Auth.logout();
            safeCb(callback)(err.data);
            return $q.reject(err.data);
          });
      },
      /**
       * Delete access token and user info
       */
      logout() {
        localStorage.removeItem('token');
        $cookies.remove('token');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional, function(error, user)
       * @return {Promise}
       */
      createUser(user, callback) {
        return User.save(user, function(data) {
            $cookies.put('token', data.token);
            currentUser = User.get();
            return safeCb(callback)(null, user);
          }, function(err) {
            Auth.logout();
            return safeCb(callback)(err);
          })
          .$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional, function(error, user)
       * @return {Promise}
       */
      changePassword(oldPassword, newPassword, callback) {
        return User.changePassword({
            id: currentUser._id
          }, {
            oldPassword: oldPassword,
            newPassword: newPassword
          }, function() {
            return safeCb(callback)(null);
          }, function(err) {
            return safeCb(callback)(err);
          })
          .$promise;
      },

      updateUser(user, callback) {
        return User.updateProfile({
            id: currentUser._id
          }, {
            user: user
          }, function() {
            return safeCb(callback)(null);
          }, function(err) {
            return safeCb(callback)(err);
          })
          .$promise;
      },

      /**
       * Gets all available info on a user
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, funciton(user)
       * @return {Object|Promise}
       */
      getCurrentUser(callback) {
        if (arguments.length === 0) {
          return currentUser;
        }

        var value = currentUser.hasOwnProperty('$promise') ? currentUser.$promise : currentUser;
        return $q.when(value)
          .then(user => {
            safeCb(callback)(user);
            return user;
          }, () => {
            safeCb(callback)({});
            return {};
          });
      },

      /**
       * Check if a user is logged in
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isLoggedIn(callback) {
        if (arguments.length === 0) {
          return currentUser.hasOwnProperty('role');
        }

        return Auth.getCurrentUser(null)
          .then(user => {
            var is = user.hasOwnProperty('role');
            safeCb(callback)(is);
            return is;
          });
      },

      /**
       * Check if a user has a specified role or higher
       *   (synchronous|asynchronous)
       *
       * @param  {String}     role     - the role to check against
       * @param  {Function|*} callback - optional, function(has)
       * @return {Bool|Promise}
       */
      hasRole(role, callback) {
        var hasRole = function(r, h) {
          return userRoles.indexOf(r) >= userRoles.indexOf(h);
        };

        if (arguments.length < 2) {
          return hasRole(currentUser.role, role);
        }

        return Auth.getCurrentUser(null)
          .then(user => {
            var has = user.hasOwnProperty('role') ? hasRole(user.role, role) : false;
            safeCb(callback)(has);
            return has;
          });
      },

      /**
       * Check if a user is an admin
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isAdmin() {
        return Auth.hasRole.apply(Auth, [].concat.apply(['admin'], arguments));
      },

      /**
       * Get auth token
       *
       * @return {String} - a token string used for authenticating
       */
      getToken() {
        if(localStorage.getItem('token')){
          return localStorage.getItem('token');
        }
        return $cookies.get('token');
      }
    };

    if ($cookies.get('token') && $location.path() !== '/logout') {
      currentUser = User.get().$promise.then(resp => {
        if (resp.role !== 'admin') {
          Auth.logout();
          return $state.go('backend');
        }

        return resp;
      });
    }

    return Auth;
  }

  angular.module('xMember.auth')
    .factory('Auth', AuthService);
})();
