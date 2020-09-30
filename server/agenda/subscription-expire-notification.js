'use strict';

import { UserModel } from '../models';
import moment from 'moment';
import { Mailer } from '../components';
import async from 'async';

module.exports = function(job, done) {

  UserModel.find({
    dateExpire: {
      $lt: moment().add(1, 'day').endOf('day')
    }
  }, function(err, users) {
    if (err) {
      return cb(err);
    }
    var date = moment().add(1, 'day').format('dddd, MMMM Do YYYY');

    async.eachSeries(users, function(user, cb) {
      Mailer.sendMail('subscription-expired-notification.html', user.email, {
        date: date,
        user: user.toObject()
      }, function() {
        cb();
      });
    });
  }, function() {
    done();
  });
};
