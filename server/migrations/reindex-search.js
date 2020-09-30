import {
  UserModel,
  PhotoModel,
  ContestModel,
  CommentModel
} from '../models';
import {
  UserEvent,
  PhotoEvent,
  ContestEvent,
  CommentEvent
} from '../events';
import keys from '../config/keys';
import async from 'async';
import request from 'request';
import config from '../config/environment';

function streaming(model, options) {
  // Load All items, 20 at a time per request
  var stream = model.scan()
    .limit(20)
    .loadAll()
    .exec();

  stream.on('readable', function () {
    let item = stream.read();
    if (!item) { return; }
    //.Items;
    item.Items.forEach(function(data) {
      options.event.emit(options.eventKey, data);
    });
  });

  stream.on('end', options.finishCb);
}

module.exports = (cb) => {
  async.waterfall([
    //down ES index
    (cb) => {
      request({
        method: 'DELETE',
        uri: `${config.ES.hosts}/_all`
      },
      function (error, response, body) {
        if (error) { return cb(error); }
        return cb();
      });
    },
    (cb) => {
      console.log('populate users...');
      streaming(UserModel, {
        event: UserEvent,
        eventKey: keys.USER_UPDATED,
        finishCb: cb
      });
    },
    (cb) => {
      console.log('populate photos...');
      streaming(PhotoModel, {
        event: PhotoEvent,
        eventKey: keys.PHOTO_UPDATED,
        finishCb: cb
      });
    },
    (cb) => {
      console.log('populate contest...');
      streaming(ContestModel, {
        event: ContestEvent,
        eventKey: keys.CONTEST_UPDATED,
        finishCb: cb
      });
    },
    (cb) => {
      console.log('populate comment...');
      streaming(CommentModel, {
        event: CommentEvent,
        eventKey: keys.COMMENT_UPDATED,
        finishCb: cb
      });
    }
  ], cb);

};