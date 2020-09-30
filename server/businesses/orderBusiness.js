import { OrderModel } from '../models';
import { OrderEvent } from '../events';
import keys from '../config/keys';

class OrderBusiness {
  /**
   * create a new Order
   * @param  {Object} data Order data
   * @return {Promise}
   */
  static create(data,user) {
    var newOrder = new OrderModel(data);
    newOrder.user = user._id;
    return newOrder.save().then((order) => {
      //fire event to another sides
      OrderEvent.emit(keys.ORDER_CREATED, order);
      return order;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Order
   * @param  {Object} Mongoose Order object
   * @return {Promise}
   */
  static update(order) {
    return order.save().then((updated) => {
      OrderEvent.emit(keys.ORDER_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data Order data
   * @return {Promise}
   */
  static updateByQuery(params) {
    //TODO - code me
    let promise = new Promise((resolve, reject) => {
      resolve(true);
    });

    return Promise;
  }

  /**
   * find list of Orders
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params,user) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var condition = {};
    var limit = 0;
    var sort = 'createdAt';
    var order = -1;
    if(params.id != 'undefined'){
      condition = {
      _id: {$ne: new ObjectId(params.id)}
      }
    }

    if(user.role != 'admin'){
      if(user){
      condition = {
        user: new ObjectId(user._id)
      }
      }
    }
    if(typeof params.sort != 'undefined'){
        sort = params.sort;
    }
    if(typeof params.order != 'undefined'){
      order = params.order;
    }
    if(params.status=='active'){
        condition.status = params.status;
    }
    if(typeof params.keyword != 'undefined' && params.sort != null){
      var regex = new RegExp(params.keyword, "i")
      condition = {'$or':[{name : regex},{address : regex},{email : regex},{description : regex}]};
    }
    if(typeof params.type != 'undefined' && params.type != ''){
        condition.type = params.type;
    }
    if(params.performerId) {
      condition.performerId = params.performerId;
    }
    if(params.limit !== 'undefined'){
      var filter = { sortCheck : order};
      filter[sort] = filter.sortCheck;
      delete filter.sortCheck;
      limit =   params.limit;
      return OrderModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return OrderModel.find(condition).count().exec();
    }
  }

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return OrderModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return OrderModel.findByIdAndRemove(id).exec()
    .then(() => {
      OrderEvent.emit(keys.ORDER_DELETED, id);

      return true;
    });
  }
}

module.exports = OrderBusiness;
