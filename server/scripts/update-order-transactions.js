import { OrderModel, TransactionModel, PerformerModel, VideoModel } from '../models';
import async from 'async';

function fixSubscription(cb) {
  OrderModel.find({
    type: 'performer_subscription',
    performerId: {
      $exists: false
    }
  }, function(err, items) {
    if (err) {
      return cb(err);
    }

    async.eachSeries(items, function(item, cb) {
      let name = item.description.replace('Monthly subscription ', '');
      name = name.replace('Yearly subscription ', '');
      PerformerModel.findOne({
        name: {
          $regex: name.trim(),
          $options: 'i'
        }
      }, function(err, performer) {
        if (err || !performer) {
          console.log('Not found performer');
          return cb();
        }

        OrderModel.update({
          _id: item._id
        }, {
          $set: {
            performerId: performer._id
          }
        }, function() {
          cb();
        });
      });
    }, cb);
  });
}

function fixSaleVideo(cb) {
  OrderModel.find({
    type: 'sale_video',
    performerId: {
      $exists: false
    },
    videoId: {
      $exists: true
    }
  }, function(err, items) {
    if (err) {
      return cb(err);
    }

    async.eachSeries(items, function(item, cb) {
      VideoModel.findOne({
        _id: item.videoId
      }, function(err, video) {
        if (err || !video) {
          console.log('cannot see video', video._id);
          return cb();
        }

        OrderModel.update({
          _id: item._id
        }, {
          $set: {
            performerId: video.user
          }
        }, function() {
          cb();
        });
      });
    }, cb);
  });
}

module.exports = function(cb) {
  async.waterfall([
    function(cb) {
      fixSubscription(() => cb());
    },
    function(cb) {
      fixSaleVideo(() => cb());
    }
  ], cb);
};
