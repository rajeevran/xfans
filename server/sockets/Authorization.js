'use strict';

var config = require('../config/environment');
var jwt = require('jsonwebtoken');
import { UserModel, PerformerModel } from '../models';

module.exports = {
  verifyJwt: function(socket, next) {
    //verity jwt and bin user data into socket object
    //then we can use these data through the app
    var handshakeData = socket.request;
    if (!handshakeData._query || !handshakeData._query.token) {
      //no user here
      return next({ err: 'Require access token' });
    }

    try {
      var decoded = jwt.verify(handshakeData._query.token, config.secrets.session);
      if (!decoded._id) {
        return next('Unauthorize!');
      }

      if (decoded.role === 'performer') {
        PerformerModel.findById(decoded._id).exec()
          .then(user => {
            if (!user || !user.isVerified || user.status === 'inactive') {
              return next({ err: 'Account is disabled' });
            }

            socket.user = user.toObject();
            socket.isPerformer = true;
            next();
          })
          .catch(next);
      } else {
        UserModel.findById(decoded._id).exec()
          .then(user => {
            if (!user) {
              return next({ err: 'Account is disabled' });
            }

            socket.user = user.toObject();
            next();
          })
          .catch(next);
      }
    } catch(err) {
      return next(err);
    }
  }
};
