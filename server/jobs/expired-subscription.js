'use strict';

import { UserModel } from '../models';
import moment from 'moment';

module.exports = function(cb) {
  cb = cb || function() {};

  UserModel.update({
    dateExpire: {
      $lt: moment().endOf('day')
    }
  }, {
    $set: {
      isVip: false
    }
  }, {
    multi: true
  })
  .exec(cb);
};
