'use strict';

import { IPBlocked } from '../models';
import moment from 'moment';

module.exports = function (cb) {
  cb = cb || function () { };

  IPBlocked.remove({
    createdAt: {
      $lt: moment().add(-1, 'hours').toDate()
    }
  }).exec(cb);
};
