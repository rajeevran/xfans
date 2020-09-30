'use strict';

var async = require('async');
var config = require('./../config/environment');
var redis = require('redis');
var store = redis.createClient(config.redis.port, config.redis.host, {
    detect_buffers: true,
    auth_pass: config.redis.pass
});

store.select(config.redis.socketsStorageDb || 0);
store.on('error', function (err) {
    console.error("Redis error: " + err);
});

process.on('exit', function (code) {
    console.log('Exit with code:', code);
    store.flushdb();
});


function Socket() {}

Socket.appId = config.app.name;
Socket.room = 'room_' + Socket.appId;

Socket.emitToSockets = function (userIds, event, data) {
    async.each(userIds, function (userId, callback) {
        Socket.emitToSocket(userId, event, data, callback);
    }, function (err) {
        /* emitted */
    });
};

Socket.emitToSocket = function (userId, event, data, callback) {
    var io = this.io;
    if (typeof userId !== 'string') {
      userId = userId.toString();
    }
    store.smembers(userId, function (err, socketIds) {
        if (err) {
            return console.error(err);
        }

        if (socketIds && Array.isArray(socketIds)) {
            socketIds.forEach(function(socketid) {
                io.to(socketid).emit(event, data);
            });
        }

        callback && callback(err);
    });
};

Socket.removeAllListeners = function (socketId, callback) {
    store.smembers('socketHandlers', function (err, events) {
        events.forEach(function (event) {
            if (!!event.indexOf(socketId)) {
                //EventBus.removeAllListeners(event);
                //remove listerner
            }
        });

        callback();
    });
};

Socket.getUser = function (socketId, callback) {
    store.hgetall(socketId, function (err, data) {
        callback(err, data);
    });
};

/**
 * check user is in the redis store (for check online/offline)
 *
 * @param {String} userId
 * @param {Function} cb
 * @returns {void}
 */
Socket.hasUser = function(userId, cb) {
    store.sismember(Socket.room, userId, function(err, data) {
        cb(!err && data);
    });
};

function removeSocket(id, callback) {
    store.del(id, function (err, affected) {
        if (err || !affected) {
            console.log('Socket connection key was not removed due to error or not found');
            console.log(err);
        } else {
            affected && console.log('Socket key ' + id + ' successfully removed');
        }

        callback(err);
    });
}

function run(socketIo, callback) {
    socketIo.on('connection', function (socket) {
        callback({
            socket: socket,
            emitToUsers: function (userIds, event, data) {
                userIds.forEach(function (userId) {
                    var id = userId.toString();
                    store.smembers(id, function (err, rooms) {
                        if (err) {
                            return console.error(err);
                        }

                        if (rooms && rooms.length) {
                            rooms.forEach(function (room) {
                                console.info('Emitting event ' + event + ' to ' + id + ' user. Room is - ' + room);
                                socketIo.to(room).emit(event, data);
                            });
                        }
                    });
                });
            },
            emitToRoom: function (name, event, data) {
                var self = this;
                store.smembers(name, function (err, userIds) {
                    if (err) {
                        return console.error(err);
                    }

                    self.emitToUsers(userIds, event, data);
                });
            }
        });

        socket.on('context', function (data) {
            //separate user type because we are using 2 diferent tables?
            var userId = socket.user ? socket.user._id.toString() : '';
            if (!userId) {
              return console.log('Missing user id');
            }

            //Set a hashtable for each client so we can look up
            //the user and channel when they disconnect
            store.hmset(socket.id, {userId: userId, appId: Socket.appId});

            // connect socket to app room
            socket.join(Socket.room);
            store.sadd(Socket.room, userId);

            //TODO - join to diferent room by user type (customer and driver)

            store.smembers(userId, function (err, members) {
                if (err) {
                    return console.error(err);
                }

                async.each(members, function (member, next) {
                    // check do we have non-active socket connection for current user and remove it if so
                    if (!socket.adapter.sids[member]) {
                        store.srem(userId, member, function (err, isRemoved) {
                            next(err);
                        });
                    } else {
                        next();
                    }
                }, function (err) {
                    if (err) {
                        return socket.emit('_error', {
                            event: 'context',
                            msg: 'SERVER_ERROR'
                        });
                    }

                    store.sadd(userId, socket.id);

                    socket.emit('_success', {
                        event: 'context',
                        msg: 'INIT_SOCKET_SUCCESSFULLY'
                    });
                });
            });
        });

        socket.on('disconnect', function () {
            Socket.removeAllListeners(socket.id, function () {
                store.hgetall(socket.id, function (err, data) {
                    if (err) {
                        return console.error(err);
                    }

                    if (data && data.userId && data.appId) {
                        // remove socket ID from user socket IDs collection
                        store.srem(data.userId, socket.id, function (err, affected) {
                            if (err || !affected) {
                                console.log('No user connections removed or error');
                                return console.error(err);
                            }

                            // remove socket id key
                            removeSocket(socket.id, function () {

                                // check does user have more connections
                                store.scard(data.userId, function (err, connections) {
                                    if (connections) {
                                        return console.log('User ' + data.userId + ' still has connections');
                                    }

                                    // remove user id from application
                                    store.srem('room_' + data.appId, data.userId, function (err, affected) {
                                        if (err || !affected) {
                                            console.log('User was not removed from redis application set');
                                            return console.error(err);
                                        }
                                    });
                                });
                            });
                        });
                    } else {
                        removeSocket(socket.id, function (err) {
                            console.warn('User (socket ID: ' + socket.id + ') disconnected');
                        });
                    }
                });
            });
        });
    });
}

Socket.init = function (socketIo, callback) {
    this.io = socketIo;
    run(socketIo, callback);
};

module.exports = Socket;
