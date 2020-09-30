'use strict';

import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';
import _ from 'lodash';

var AffiliateAccount = new Schema({
  name: String,
  username: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  salt: String,
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  }
}, {
  restrict: true,
  minimize: false
});

// Validate email is not taken
AffiliateAccount
  .path('username')
  .validate(function(value, respond) {
    var self = this;

    return this.constructor.findOne({ username: value.toLowerCase() }).exec()
      .then(function(user) {
        if (user) {
          if (self.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }

        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified username is already in use.');


/**
 * Pre-save hook
 */
AffiliateAccount.pre('save', function(next) {
  this.wasNew = this.isNew;

  if (this.isNew) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  } else {
    this.updatedAt = new Date();
  }
  // Handle new/update passwords
  if (!this.isModified('password')) {
    return next();
  }
  // Make salt with a callback
  this.makeSalt((saltErr, salt) => {
    if (saltErr) {
      return next(saltErr);
    }
    this.salt = salt;
    this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
      if (encryptErr) {
        return next(encryptErr);
      }
      this.password = hashedPassword;
      next();
    });
  });
});


/**
 * Methods
 */
AffiliateAccount.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if (err) {
        return callback(err);
      }

      if (this.password === pwdGen) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} byteSize Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    var defaultByteSize = 16;

    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    if (!callback) {
      return crypto.randomBytes(byteSize).toString('base64');
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if (err) {
        callback(err);
      } else {
        callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */

   encryptPassword(password, callback) {
     if (!password || !this.salt) {
       if (!callback) {
         return null;
       } else {
         return callback('Missing password or salt');
       }
     }

     var defaultIterations = 10000;
     var defaultKeyLength = 64;
     var salt = new Buffer(this.salt, 'base64');

     if (!callback) {
       return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha1')
                    .toString('base64');
     }

     return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1', (err, key) => {
       if (err) {
         callback(err);
       } else {
         callback(null, key.toString('base64'));
       }
     });
   },
};

module.exports = mongoose.model('AffiliateAccount', AffiliateAccount);
