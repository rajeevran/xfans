'use strict';

import {
  PerformerModel, MessageGroupModel
} from '../models';
import async from 'async';

module.exports = function (job, done) {
  PerformerModel.find({}, function (err, performers) {
    if (err) {
      return done();
    }
    let performerIds = performers.map(p => p._id);
    async.eachSeries(performers, function (performer, cb) {
      const index = performerIds.indexOf(performer._id);
      performerIds.splice(index, 1);
      async.eachSeries(performerIds, function (pid, cb) {
        let body = {
          $or: [{
              userIds: [performer._id, pid]
            },
            {
              userIds: [pid, performer._id]
            }
          ]
        };
        MessageGroupModel.count(body, (err, group) => {
          if (group) {
            return cb(null)
          }
          group = new MessageGroupModel({
            userIds: [performer._id, pid],
            type: 'model'
          });
          group.save(cb);
        });
      }, function() {
        cb()
      })
    });
  }, function () {
    done();
  });
};
