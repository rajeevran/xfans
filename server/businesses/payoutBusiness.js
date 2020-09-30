import { PayoutModel } from '../models';
import async from 'async';

/**
 * create a new Request Payout
 * @param  {Object} data Payout data
 * @return {Promise}
 */
exports.create = function (data) {
  var newPayout = new PayoutModel(data);
  return newPayout.save().then((payout) => {
    return payout;
  })
      .catch(e => {
        //console.log(e);
      });
};

/**
 * update Bloggory
 * @param  {Object} Mongoose Bloggory object
 * @return {Promise}
 */
exports.update = function (payout) {
  return payout.save().then((updated) => {
    return updated;
  });
};

/**
 * find list of Request payout
 * @param  {Object} params Mongo query
 * @return {Promise}
 */
exports.find = function (params, callback) {
  var condition = {};
  var limit = 10;
  var offset = 0;
  var sort = 'title';
  var order = 1;
  var filter = {};

  if (params.status) {
    condition.status = params.status;
  }
  if (params.keyword) {
    var regex = new RegExp(params.keyword, "i");
    condition.title = regex;
  }
  if (params.limit) {
    limit = params.limit;
  }
  if (params.offset) {
    offset = params.offset;
  }
  if (params.sort && params.order) {
    sort = params.sort;
    order = params.order;
    filter[sort] = order;
  }

  async.parallel({
    count: function (cb) {
      PayoutModel.count(condition, function (err, count) {
        cb(err, count);
      });
    },
    items: function (cb) {
      PayoutModel.find(condition).sort(filter).skip(offset * limit).limit(limit).exec(function (err, payouts) {
        cb(err, payouts);
      });
    }
  }, function (err, results) {
    callback(err, results);
  });
};


/**
 * find single record by params
 * @param  {Object} params Mongo query
 * @return {Promise}
 */
exports.findOne = function (params) {
  return PayoutModel.findOne(params).exec();
};

/**
 * delete event
 * @param  {String} id
 * @return {Promise}
 */
exports.removeById = function (id) {
  return PayoutModel.findByIdAndRemove(id).exec()
      .then(() => {
        return true;
      });
};
