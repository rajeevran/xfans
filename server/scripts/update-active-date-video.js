import { VideoModel } from '../models';
import async from 'async';

module.exports = function(cb) {
  VideoModel.find({}, '_id updatedAt', function(err, items) {
    if (err) {
      return cb(err);
    }
    console.log('Start update ' + items.length);
    async.eachSeries(items, function(item, cb) {
      VideoModel.update({ _id: item._id }, {
        $set: {
          activeDate: item.updatedAt
        }
      }, function() {
        cb();
      });
    }, cb);
  });
};
