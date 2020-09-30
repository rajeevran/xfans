'use strict';
import { VideoModel, PerformerModel, UserSubscriptionModel, PhotoModel } from '../models';
import async from 'async';
import moment from 'moment-timezone';

module.exports = (job, done) => {
  var fromTime = moment().tz('America/New_York').startOf('day').hour(7.5).toDate();
  var toTime = moment().tz('America/New_York').endOf('day').toDate();

  async.waterfall([
    function(cb) {
      VideoModel.update({
        isSchedule: true,
        $or: [{
          schedule: {
            $gte: fromTime,
            $lte: toTime
          }
        }, {
          schedule: {
            $lt: new Date()
          }
        }]
      }, {
        $set: {
          isSchedule: false,
          type: 'recent',
          //createdAt: new Date(),
          updatedAt: new Date(),
          activeDate: new Date(),
          status: 'active'
        }
      }, {
        multi: true
      }, function(err, data) {
        console.log('Done for schedule with ', err, data);
        cb();
      });
    },
    function(cb) {
      PerformerModel.find({}, function(err, performers) {
        if (err) {
          return cb();
        }

        async.eachSeries(performers, function(performer, cb) {
          async.auto({
            totalSubscriber(cb) {
              UserSubscriptionModel.count({
                performerId: performer._id,
                expiredDate: {
                  $gte: new Date()
                }
              }, cb);
            },
            totalPhoto(cb) {
              PhotoModel.count({
                performer: {
                  $in: [performer._id]
                }
              }, cb);
            },
            totalVideo(cb) {
              VideoModel.count({
                performer: {
                  $in: [performer._id]
                },
                status: 'active'
              }, cb);
            }
          }, function(err, result) {
            if (err) {
              return cb();
            }

            PerformerModel.update({
              _id: performer._id
            }, {
              $set: {
                totalSubscriber: result.totalSubscriber,
                totalVideo: result.totalVideo,
                totalPhoto: result.totalPhoto
              }
            }, cb);
          });
        }, cb);
      });
    }
  ], function() {
    done();
  });
};
