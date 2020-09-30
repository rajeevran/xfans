'use strict';
import { VideoModel, ScheduleModel  } from '../../models';
import async from 'async';
import moment from 'moment-timezone';
import _ from 'lodash';

exports.getCalendar = function(req, res) {
  let start = req.query.start ? moment(req.query.start).tz('America/New_York').startOf('day') : moment().startOf('day');
  let end = req.query.start ? moment(req.query.end).tz('America/New_York').endOf('day') : moment().endOf('day');

  async.auto({
    scheduleVideos(cb) {
      let query = {
        schedule: {
          $gte: start,
          $lte: end
        }
      };
      if (req.query.performerId) {
        query.performer = {
          $in: [req.query.performerId]
        };
      }

      VideoModel.find(query, function(err, videos) {
        if (err) {
          return cb([]);
        }

        cb(null, _.map(videos, video => {
          return {
            _id: video._id,
            name: video.name,
            start: video.schedule,
            end: video.schedule,
            type: 'video'
          };
        }));
      });
    },
    scheduleEvents(cb) {
      let condition = {
        from : {
          $gte: start,
          $lte: end
        }
      };

      if (req.query.performerId) {
        condition.performerId = req.query.performerId;
      }

      ScheduleModel.find(condition).exec(function(err, events) {
        if (err) {
          return cb([]);
        }

        cb(null, _.map(events, event => {
          return {
            _id: event._id,
            title: event.title,
            description: event.description,
            start: event.from,
            end: event.to,
            type: 'event'
          };
        }));
      });
    }
    //TODO - define more schedule time here
  }, function(err, data) {
    if (err) {
      return res.status(500).send(err);
    }
    let items = [];
    items = data.scheduleVideos.concat(data.scheduleEvents)
    res.status(200).send(items);
  });
};

exports.list = function(req, res) {
  let start = req.query.start ? moment(req.query.start).tz('America/New_York').toDate() : moment().startOf('month').toDate();
  let end = req.query.end ? moment(req.query.end).tz('America/New_York').toDate() : moment().endOf('month').toDate();

  let query = {};

  if (req.query.performerId) {
    query.performerId = req.query.performerId;

  }

  async.parallel({
    count(cb) {
      ScheduleModel.count(query, cb);
    },
    items(cb) {
      ScheduleModel.find(query)
        .sort({createdAt: -1, name: 1 })
        .exec(cb);
    }
  }, (err, result) => {
    if (err) { return res.status(500).send(err); }

    res.status(200).json(result);
  });
};

exports.create = function(req, res) {
  let item = new ScheduleModel(_.assign(req.body, {
    from: new Date(req.body.from),
    to: new Date(req.body.to)
  }));
  item.save((err, data) => res.status(err ? 500 : 200).send(data));
};

exports.update = function(req, res) {
  delete req.body._id;
  req.schedule = _.merge(req.schedule, req.body);
  req.schedule.save((err, data) => res.status(err ? 500 : 200).send(data));
};

exports.delete = function(req, res) {
  req.schedule.remove(err => res.status(err ? 500 : 200).send({ success: err ? false : true }));
};

exports.findOne = function(req, res) {
  res.status(200).send(req.schedule);
};

exports.middlewares = {
  findOne(req, res, next) {
    ScheduleModel.findOne({ _id: req.params.id }, function(err, data) {
      if (err || !data) {
        return res.status(404).send(err);
      }

      req.schedule = data;
      next();
    });
  }
};
