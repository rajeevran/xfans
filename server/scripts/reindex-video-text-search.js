import { VideoModel } from '../models';
import async from 'async';

module.exports = function(cb) {
  VideoModel.find({}, function(err, items) {
    if (err) {
      return cb(err);
    }

    async.eachSeries(items, function(item, cb) {
      VideoModel.update({
        _id: item._id
      }, {
        $set: {
          nameSearch: item.name
        }
      })
      .exec(cb);
    }, cb);
  });
};
