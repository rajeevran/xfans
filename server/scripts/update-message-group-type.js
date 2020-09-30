import { MessageGroupModel, PerformerModel, UserModel } from '../models';
import async from 'async';

module.exports = function(cb) {
  MessageGroupModel.find({}, function(err, items) {
    if (err) {
      return cb(err);
    }
    console.log('Start update ' + items.length);
    async.eachSeries(items, function(item, cb) {
      //check user or check model
      async.auto({
        users(cb) {
          UserModel.count({
            _id: item.userIds
          }, cb);
        },
        performers(cb) {
          PerformerModel.count({
            _id: item.userIds
          }, cb);
        }
      }, function(err, result) {
        console.log(result);
        if (err || result.performers !== 2 ) {
          return cb();
        }

        item.type = 'model';
        item.save(cb);
      });
    }, cb);
  });
};
