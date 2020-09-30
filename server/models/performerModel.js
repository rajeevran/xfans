'use strict';

import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import _ from 'lodash';
import async from 'async';

var schema = new Schema({
  name: String,
  username: {
    type: String,
    default: '',
    index: true
  },
  alias: String,
  description: String,
  sex: String,
  eyes: String,
  sexualPreference: String,
  ethnicity: String,
  age: Number,
  languages: String,
  height: String,
  hometown: String,
  weight: String,
  publicHair  : String,
  hair: String,
  bust: String,
  sort: Number,
  imageFullPath: String,
  imageThumbPath: String,
  imageMediumPath: String,
  imageType: {
    type: String,
    enum: ['s3', 'direct']
  },
  stats: {
    totalLike: { type: Number, default: 0 },
    totalVideo: { type: Number, default: 0 },
    totalPhoto: { type: Number, default: 0 },
    totalComment: { type: Number, default: 0 }
  },
  user: {
  	type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'
  },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  type: {
    type: String,
    enum: ['registered', 'system'],
    default: 'system'
  },
  email: {
    type: String,
    lowercase: true
  },
  emailVerifiedToken: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  salt: String,
  password: {
    type: String
  },
  idImg1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileModel'
  },
  idImg2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileModel'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscriptionMonthlyPrice: {
    type: Number,
    default: 1
  },
  subscriptionYearlyPrice: {
    type: Number,
    default: 1
  },
  totalLike: { type: Number, default: 0 },
  totalVideo: { type: Number, default: 0 },
  totalPhoto: { type: Number, default: 0 },
  totalComment: { type: Number, default: 0 },
  totalSubscriber: {
    type: Number,
    default: 0
  },
  totalView: {
    type: Number,
    default: 0
  },
  bankDateofBirth: {
    type: String
  },
  bankFirstName: {
    type: String
  },
  bankLastName: {
    type: String
  },
  bankLegalType: {
    type: String
  },
  bankBusinessTaxId: {
    type: String
  },
  bankBusinessTitle: {
    type: String
  },
  bankCountry: {
    type: String
  },
  bankSsn: {
    type: String
  },
  bankState: {
    type: String
  },
  bankCity: {
    type: String
  },
  bankAddress: {
    type: String
  },
  bankName: {
    type: String
  },
  bankAccount: {
    type: String
  },
  bankSwiftCode: {
    type: String
  },
  bankRounding: {
    type: String
  },
  bankBankAddress: {
    type: String
  },
  bankZip: {
    type: String
  },
  tipCommision: {
    type: Number,
    default: 0
  },
  subscriptionCommision: {
    type: Number,
    default: 0
  },
  storeComission: {
    type: Number,
    default: 0
  },
  welcomeVideo: {
    type: String
  },
  welcomePhoto: {
    type: String
  },
  welcomeOption: {
    type: String,
    enum: ['video', 'photo']
  },
  showHome: {
    type: Boolean,
    default: true
  },
  //https://kb.ccbill.com/Dynamic+Pricing
  ccbill: {
    formMonthSubscription: {
      type: String,
      default: ''
    },
    formYearlySubscription: {
      type: String,
      default: ''
    },
    formSinglePayment: {
      type: String,
      default: ''
    },
    subAccountSubscription: {
      type: String,
      default: ''
    },
    subAccountStore: {
      type: String,
      default: ''
    },
    subAccountSaleVideo: {
      type: String,
      default: ''
    },
    subAccountTip: {
      type: String,
      default: ''
    }
  },
  allowIds: [],
  connectTwitter: {
    type: Boolean,
    default: false
  },
  twitterAccessToken: {
    type: String
  },
  twitterAccessSecret: {
    type: String
  },
  autoPostTwitter: {
    type: Boolean,
    default: false
  },
  customTwitterTextVideo: {
    type: String,
    default: ''
  }
}, {
  collection: 'performers',
  restrict: true,
  minimize: false,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

schema.method('toJSON', function() {
  var performer = this.toObject();
  delete performer.twitterAccessToken;
  delete performer.autoPostTwitter;
  return performer;
});
/**
 * Pre-save hook
 */
schema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    this.alias = this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');

    //generate username for model if not have
    let _this = this;
    async.auto({
      checkUsername(cb) {
        if ((!_this.username && _this.name) || _this.isModified('username')) {
          let stopFindUsername = false;
          let i = 0;
          let username = _this.username ? _this.username.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : _this.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
          async.during(
            function(cb) {
              return cb(null, stopFindUsername === false);
            },
            function(cb) {
              _this.model('PerformerModel').count({
                username: username,
                _id: {
                  $ne: _this._id
                }
              }, function(err, count) {
                if (!err && !count) {
                  stopFindUsername = true;
                } else {
                  username += i;
                }

                cb();
              });
            },
            function() {
              _this.username = username;
              cb();
            }
          );
        } else {
          cb();
        }
      },
      pw(cb) {
        if (_this.isModified('password')) {
          _this.makeSalt((saltErr, salt) => {
            if (saltErr) {
              return next(saltErr);
            }
            _this.salt = salt;
            _this.encryptPassword(_this.password, (encryptErr, hashedPassword) => {
              if (encryptErr) {
                return next(encryptErr);
              }
              _this.password = hashedPassword;
              cb();
            });
          });
        } else {
          cb();
        }
      }
    }, function() {
      next();
    });
  });

schema.post('save', function(doc) {
  let VideoModel = require('./videoModel');
  VideoModel.update({
    performer: {
      $in: [doc._id]
    }
  }, {
    $set: {
      showHome: doc.showHome
    }
  }, {
    multi: true
  }, function() {});
});

/**
 * Methods
 */
schema.methods = {
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

  toJSON() {
    var obj = this.toObject()
    delete obj.password;
    delete obj.salt;

    return obj;
  },

  publicProfile() {
    return Object.assign(_.pick(this, [
      'name',
      'username',
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
    ]), {
      type: 'performer',
      role: 'performer'
    });
  }
};

module.exports = mongoose.model('PerformerModel', schema);
