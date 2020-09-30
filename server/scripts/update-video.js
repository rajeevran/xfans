import { VideoModel } from '../models';
import async from 'async';

module.exports = function(cb) {
  VideoModel.find({}, function(err, items) {
    if (err) {
      return cb(err);
    }

    async.eachSeries(items, function(item, cb) {
      item.save(cb);
    }, cb);
  });
};
