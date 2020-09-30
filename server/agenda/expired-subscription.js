'use strict';

import { UserModel } from '../models';
import moment from 'moment';

module.exports = function(job, done) {

  UserModel.update({
    dateExpire: {
      $lt: moment().endOf('day')
    },
    isVip: true
  }, {
    $set: {
      isVip: false
    }
  }, {
    multi: true
  }, function() {
    done();
  })
};
