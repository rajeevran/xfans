import { OrderModel, UserModel } from '../models';
import async from 'async';
import _ from 'lodash';

module.exports = function(cb) {
  async.auto({
    orders(cb) {
      OrderModel.find({type: 'sale_video'}, cb)
    },
    users: ['orders', (result, cb) => {
      if (!result.orders.length) {
        return cb(null)
      }
      const userIds = result.orders.map(o => o.user);
      UserModel.find({
        _id: {
          $in: userIds
        }
      }, cb)
    }]
  }, function(err, result) {
    if (err) {
      return cb(err)
    }
    async.eachSeries(result.orders, function(item, cb) {
      const user = _.find(result.users, user => user._id.toString() === item.user.toString());
      item.email = user.email;
      item.name = user.name,
      item.save(cb);
    }, cb);
  })

};
