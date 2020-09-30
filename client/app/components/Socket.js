/* global io, angular */
'use strict';

angular.module('xMember')
.factory('socket', function (Auth, socketFactory, appConfig) {
  // socket.io now auto-configures its connection when we ommit a connection url
  var ioSocket = io(appConfig.socketUrl, {
    // Send auth token on connection, you will need to DI the Auth service above
    query: 'token=' + Auth.getToken(),
    path: '/socket.io'
  });

  var isReady = false;
  var socket = socketFactory({ ioSocket: ioSocket });
  function connectSocket() {
    Auth.getCurrentUser(function(user) {
      var sessionId = user ? user._id : Math.random().toString(36).substring(7);
      socket.emit('context', { userId: sessionId });
    });
  }
  socket.on('connect', function () {
    connectSocket();
  });

  socket.on('reconnect', function() {
    connectSocket();
  });

  //socket.on('disconnect', cleaner);
  socket.on('_success', function (data) {
    if (data.event === 'context') {
      isReady = true;
    }
  });

  return {
    socketIo: socket,
    ready: function (cb) {
      if (isReady) {
        return cb();
      }

      function timeoutCheck(cb) {
        if (isReady) {
          cb();
        } else {
          setTimeout(function() {
            timeoutCheck(cb);
          }, 100);
        }
      }

      timeoutCheck(cb);
      //TODO - add cancel?
    },
    reconnect: function() {
      socket.options.query = 'token=' + Auth.getToken();
      socket.connect();
    }
  };
});
