import Joi from 'joi';
import async from 'async';
import _ from 'lodash';
import { MessageGroupModel, MessageModel, UserModel, PerformerModel, BlockPerformerModel, UserSubscriptionModel } from '../../models';
import Socket from '../../sockets/Socket';
import { Uploader, S3, GM } from '../../components';

function findMessage(req, res, next) {
  MessageModel.findById(req.params.id, (err, message) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!message) {
      return res.status(404).send({ msg: 'Message not found!' });
    }

    req.message = message;
    next();
  });
}

exports.findMessage = findMessage;

/**
 * Create or get message group
 */
exports.createGroup = function(req, res) {
  if (!req.body.params.recipientId || req.user._id.toString() === req.body.params.recipientId) {
    return res.status(422).json({recipientId: 'recipientId is required'});
  }

  //find or create new group
  MessageGroupModel.findOne({
    $or: [
      {
        userIds: [req.user._id, req.body.params.recipientId]
      },
      {
        userIds: [req.body.params.recipientId, req.user._id]
      }
    ]
  }, (err, group) => {
    if (err) { return res.status(500).send({ msg: 'Server error!' }); }
    if (group) { return res.status(200).send(group)}
    group = new MessageGroupModel({
      userIds: [req.user._id, req.body.params.recipientId],
      type: req.body.params.type || 'subscriber'
    });
    group.save((err, saved) => {
      if (err) { return res.status(500).send({ msg: 'Server error!' }); }

      //TODO - notify recipient?
      res.status(200).send(saved);
    });
  });
};

/**
 * Get message groups of current user
 */

exports.getAllGroups = function(req, res) {
  let query = {
    userIds: {
      $in: [req.user._id]
    }
  };
  if (req.query.type) {
    query.type = req.query.type;
  }
  MessageGroupModel.find(query)
  .sort('-updatedAt')
  .exec((err, groups) => {
    if (err) { return res.status(500).send({ msg: 'Server error!' }); }
    //get user in the groups
    let results = [];
    let userIds = [];
    groups.forEach(group => userIds = userIds.concat(group.userIds));
    async.auto({
      p(cb) {
        PerformerModel.find({
          _id: {
            $in: userIds
          }
        }, cb);
      },
      u(cb) {
        UserModel.find({
          _id: {
            $in: userIds
          }
        }, cb)
      },
      users: ['p', 'u', function(result, cb) {
        let users = result.p.concat(result.u);
        cb(null, users);
      }],
      userIds: ['users', function(result, cb) {
        cb(null, result.users.map(u => u._id));
      }],
      blockPerformers: ['userIds', (result, cb) => {
        if (!result.userIds.length) {
          return cb(null, []);
        }

        BlockPerformerModel.find({
          objectId: req.user._id,
          userId: {
            $in: result.userIds
          }
        }, cb);
      }],
      subscribers: ['userIds', function(result, cb) {
        if (!result.userIds.length) {
          return cb(null, []);
        }

        UserSubscriptionModel.find({
          userId: req.user._id,
          performerId: {
            $in: result.userIds
          },
          expiredDate: {
            $gt: new Date()
          }
        }, cb);
      }]
    }, function(err, result) {
      if (err) {
        return res.status(400).send(err);
      }

      let items = [];
      groups.forEach(g => {
        let group = g.toObject();
        group.users = result.users.filter(u => {
          return _.findIndex(g.userIds, gU => gU.toString() === u._id.toString()) > -1;
        })
        .map((user) => {
          return Object.assign(user.publicProfile(), {
            avatarUrl: user.avatarUrl,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName
          });
        });

        let recipientId = _.find(group.userIds, u => u.toString() !== req.user._id.toString());
        if (!recipientId) {
          return;
        }
        group.blocked = _.findIndex(result.blockPerformers, blockPerformer => blockPerformer.userId.toString() === recipientId.toString()) > -1;
        group.subscribed = _.findIndex(result.subscribers, subscriber => subscriber.performerId.toString() === recipientId.toString()) > -1;
        items.push(group);
      });

      res.status(200).send(items);
    });
  });
};

/**
 * Create new message
 */
exports.createMessage = function(req, res) {
  let schema = Joi.object().keys({
    messageGroupId: Joi.string().required(),
    content: Joi.string().required()
  });
  let result = Joi.validate(req.body, schema);
  if (result.error) {
    return res.status(422).json(result.error);
  }

  async.waterfall([
    function(cb) {
      let userIds = [req.user._id, result.value.recipientId];
      MessageGroupModel.findById(req.body.messageGroupId, cb);
    }
  ], (err, group) => {
    if (err || !group) {
      return res.status(404).send({ msg: 'Group not found!' });
    }
    let index = _.findIndex(group.userIds, id => id.toString() === req.user._id.toString());
    if (index === -1) {
      return res.status(403).send({ msg: 'Forbidden!' });
    }

    let model = new MessageModel(Object.assign(result.value, {
      senderId: req.user._id
    }));
    model.save((err, message) => {
      if (err) { return res.status(500).send(err); }

      let userIds = group.userIds.filter(id => id.toString() !== message.senderId.toString());
      Socket.emitToSockets(userIds, 'NEW_MESSAGE', message);
      res.status(200).json(message);
    });
  });
};

exports.sendImage = function(req, res) {
  async.waterfall([
    function(cb) {
      MessageGroupModel.findById(req.body.messageGroupId, cb);
    }
  ], (err, group) => {
    if (err || !group) {
      return res.status(404).send({ msg: 'Group not found!' });
    }
    let index = _.findIndex(group.userIds, id => id.toString() === req.user._id.toString());
    if (index === -1) {
      return res.status(403).send({ msg: 'Forbidden!' });
    }

    Uploader.uploadImage(req.files.file, req.user._id, function(err, image) {
      let model = new MessageModel({
        senderId: req.user._id,
        type: 'image',
        content: image,
        messageGroupId: req.body.messageGroupId
      });
      model.save((err, message) => {
        if (err) { return res.status(500).send(err); }

        let userIds = group.userIds.filter(id => id.toString() !== message.senderId.toString());
        Socket.emitToSockets(userIds, 'NEW_MESSAGE', message);
        res.status(200).json(message);
      });
    });
  });
};

/**
 * read message
 */
exports.readMessage = function(req, res) {
  req.message.read = true;
  req.message.save((err, message) => {
    if (err) { return res.status(500).send(err); }

    res.status(200).json(message);
  });
};

/**
* get messages in a group
*/
exports.getMessagesInGroup = function(req, res) {
  let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
  let take = parseInt(req.query.take) || 10;

  MessageGroupModel.find({
    _id: req.params.id,
    userIds: { $in: [req.user._id] }
  }, (err, group) => {
    if (err || !group) { return res.status(500).send(err); }

    let query = { messageGroupId: req.params.id };
    async.parallel({
      count(cb) {
        MessageModel.count(query, cb);
      },
      items(cb) {
        MessageModel.find(query)
          .sort({ createdAt: -1 })
          .skip(page * take)
          .limit(take)
          .exec(cb);
      }
    }, (err, result) => {
      if (err) { return res.status(500).send({ msg: 'Server error!' }); }

      res.status(200).json(result);
    });
  });
};
