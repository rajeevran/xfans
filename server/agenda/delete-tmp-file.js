import fs from 'fs';
import async from 'async';
import { TmpFile } from '../models';
import moment from 'moment';

module.exports = function(job, cb) {
  TmpFile.find({
    createdAt: {
      $lt: moment().add(-4, 'hour').toDate()
    }
  }, function(err, files) {
    if (err || !files) {
      return cb();
    }

    async.eachSeries(files, function(f, cb) {
      fs.unlink(f.filePath, function() {
        f.remove(() => cb());
      });
    }, cb);
  });
};
