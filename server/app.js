/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});
mongoose.set('debug',true)
// Setup server
var app = express();
var server = http.createServer(app);
//Setup Socket
var socketio = require('socket.io')(server, {
  serveClient: true,// config.env !== 'production',
  path: '/socket.io-client'
});

require('./sockets')(socketio);
require('./config/express')(app);
require('./routes').default(app);
// require('./jobs');
require('./agenda');
require('./queues');
if (process.env.NODE_ENV === 'production') {
  //require('./runAfterStart')();
}

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
//setup queues as a worker
require('./queues');

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
