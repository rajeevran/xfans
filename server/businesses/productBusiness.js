import { ProductModel } from '../models';
import { ProductEvent } from '../events';
import keys from '../config/keys';

class ProductBusiness {
  /**
   * create a new Product
   * @param  {Object} data Product data
   * @return {Promise}
   */
  static create(data, user) {
    var newProduct = new ProductModel(data);
    newProduct.user = user._id;
    if (user.isPerformer) {
      newProduct.performerId = user._id;
    }

    return newProduct.save().then((product) => {
      //fire event to another sides
      ProductEvent.emit(keys.PRODUCT_CREATED, product);
      return product;
    })
    .catch(e => {
      //return e
      //console.log(e);
    });
  }

  /**
   * update Product
   * @param  {Object} Mongoose Product object
   * @return {Promise}
   */
  static update(product) {
    return product.save().then((updated) => {
      ProductEvent.emit(keys.PRODUCT_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data Product data
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
   * find list of Products
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var condition = {};
    var limit = 0;
    var sort = 'createdAt';
    var order = -1;
    if(params.id != 'undefined' && params.type=='other'){
      condition = {
      _id: {$ne: new ObjectId(params.id)}
      }

    }else if(params.id != 'undefined' && params.type=='performer'){
      condition = {
        performer: new ObjectId(params.id)
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
      condition = {'$or':[{name : regex}]};
    }

    if (params.categoryId) {
      condition.categoryIds = {
        $in: [params.categoryId]
      };
    }

    if (params.performerId) {
      condition.performerId = params.performerId;
    }

    if(params.limit !== 'undefined'){
      var filter = { sortCheck : order};
      filter[sort] = filter.sortCheck;
      delete filter.sortCheck;
      limit =   params.limit;
      return ProductModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return ProductModel.find(condition).count().exec();
    }
  }

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return ProductModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return ProductModel.findByIdAndRemove(id).exec()
    .then(() => {
      ProductEvent.emit(keys.PRODUCT_DELETED, id);

      return true;
    });
  }
}

module.exports = ProductBusiness;
