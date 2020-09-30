'use strict';

import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';
import Mailchimp from './Mailchimp';
import _ from 'lodash';
const authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
  name: String,
  firstName: String,
  lastName: String,
  phone: String,
  photo: String,
  imageThumbPath: String,
  imageMediumPath: String,
  country: String,
  city: String,
  subscriptionId: String,
  imageType: {
    type: String,
    enum: ['s3', 'direct']
  },
  email: {
    type: String,
    lowercase: true,
    required: function() {
      if (authTypes.indexOf(this.provider) === -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedToken: {
    type: String
  },
  isVip:{
    type:Boolean,
    default:false
  },
  isBuyProduct:{
    type:Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive']
  },
  role: {
    type: String,
    default: 'user'
  },
  settings:{
    commentNotify:{
      type:Boolean,
      default:true
    },
    videoNotify:{
      type:Boolean,
      default:true
    },
    photoNotify:{
      type:Boolean,
      default:true
    }
  },
  password: {
    type: String,
    required: function() {
      if (authTypes.indexOf(this.provider) === -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  favoriteVideo:[],
  watchLaterVideo:[],
  downloadedVideo:[],
  membershipLevel:{
    type: String,
    enum: ['normal', 'premiumMember']
  },
  provider: String,
  salt: String,
  package: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'MemberShipPackageModel'
  },
  dateExpire: {
  	type: Date, default: Date.now
  },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  },
  facebook: {},
  twitter: {},
  google: {},
  github: {},
  userTempId: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserTempModel'
  }
}, {
  collection: 'users',
  restrict: true,
  minimize: false
});

/**
 * Virtuals
 */

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return password.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    if (authTypes.indexOf(this.provider) !== -1) {
      return respond(true);
    }

    return this.constructor.findOne({ email: value }).exec()
      .then(function(user) {
        if (user) {
          if (self.id === user.id || self.role=='admin') {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
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
    this.markModified('membershipLevel');
    if (!validatePresenceOf(this.password)) {
      if (authTypes.indexOf(this.provider) === -1) {
        return next(new Error('Invalid password'));
      } else {
        return next();
      }
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

  UserSchema
    .post('save', function(next) {
      if (this.wasNew && this.email) {
        Mailchimp.add({
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email
        });
      }
    });

/**
 * Methods
 */
UserSchema.methods = {
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

  publicProfile() {
    return _.pick(this, [
      'name',
      'firstName',
      'lastName',
      'phone',
      'photo',
      'imageThumbPath',
      'imageMediumPath',
      'country',
      'city',
      'imageType',
      'role',
      '_id'
    ]);
  }
};

module.exports = mongoose.model('UserModel', UserSchema);
