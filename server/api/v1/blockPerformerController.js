'use strict';

import { PerformerModel, BlockPerformerModel, UserModel} from '../../models';
import _ from 'lodash';
import async from 'async';

exports.list = function(req, res) {
  let query = {};
  if (req.query.userId) {
    query.userId = req.query.userId;
  }
  
  BlockPerformerModel.find(query)
    .sort({ createdAt: -1 })
    .exec((err, items) => {
      if (err) { return res.status(500).send({ msg: 'Server error!' }); }
      let results = [];
      async.eachSeries(items, function(item, cb) {
        let obj = item.toObject();
        async.auto({
          performer(cb) {
            PerformerModel.findOne({
              _id: obj.objectId
            }, cb);
          },
          user(cb) {
            UserModel.findOne({
              _id: obj.objectId
            }, cb)
          }
        }, function(err, result) {
          if (err) {
             res.status(500).send({ msg: 'Server error!'})
          }

          let performerInfo = _.pick(result.performer, ['name', 'email', 'role', 'imageMediumPath']);
          let userInfo = _.pick(result.user, ['name', 'email', 'role', 'imageMediumPath']);
          if (!result.user){
            item.objectInfo = performerInfo;
          }else if (!result.performer) {
            item.objectInfo = userInfo;
          }
          results.push(item);
          cb();
        })
      },() => res.status(200).send(results))
    });

};

exports.create = function(req, res) {
  let item = new BlockPerformerModel(req.body);
  item.save((err, data) => res.status(err ? 500 : 200).send(data));
};

exports.checkBlock = function(req, res) {
  BlockPerformerModel.count({
    objectId: req.query.objectId,
    userId: req.query.userId
  }, function(err, count) {
    let blocked = !err && count;
    res.status(200).send({ blocked });
  });
};
exports.update = function(req, res) {
  delete req.body._id;
  req.block = _.merge(req.block, req.body);
  req.block.save((err, data) => res.status(err ? 500 : 200).send(data));
};

exports.delete = function(req, res) {
  req.block.remove(err => res.status(err ? 500 : 200).send({ success: err ? false : true }));
};

exports.findOne = function(req, res) {
  res.status(200).send(req.block);
};

exports.middlewares = {
  findOne(req, res, next) {
    BlockPerformerModel.findOne({ _id: req.params.id }, function(err, data) {
      if (err || !data) {
        return res.status(404).send(err);
      }

      req.block = data;
      next();
    });
  }
};
