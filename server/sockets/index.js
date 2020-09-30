var Socket = require('./Socket');
var Authorization = require('./Authorization');
var path = require('path');
var fs = require('fs');

function _parse(initPath, callback) {
  fs.readdirSync(initPath).forEach(function (name) {

    var itemPath = path.join(initPath, name);
    var stat = fs.statSync(itemPath);

    if (stat && stat.isDirectory(itemPath)) {
        //recursive dir reading
        _parse(itemPath, callback);
    } else {
      if (path.extname(itemPath) === '.js') {
        callback(itemPath, name);
      }
    }
  });
}

module.exports = function(socketio) {
  //set auth here
  socketio.use(function (socket, next) {
    Authorization.verifyJwt(socket, next);
  });

  //TODO - check handshake here
  Socket.init(socketio, function (component) {
    // EventBus handlers with sockets
    _parse(path.join(__dirname, 'listeners'), function (itemPath) {
        require(itemPath)(component);
    });
  });
}
