import { CategoryModel } from '../models';

class CategoryBusiness {
  /**
   * create a new Category
   * @param  {Object} data Category data
   * @return {Promise}
   */
  static create(data) {
    var newCategory = new CategoryModel(data);
    return newCategory.save().then((category) => {
      return category;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Category
   * @param  {Object} Mongoose Category object
   * @return {Promise}
   */
  static update(category) {
    return category.save();
  }

  /**
   * Update all data by query
   * @param  {Object} data Category data
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
   * find list of Categorys
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var condition = {};
    var limit = 0;
    var sort = 'name';
    var order = 1;
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
    if(params.alias){
      condition.alias = params.alias;
    }
    if(params.limit !== 'undefined'){
      var filter = { sortCheck : order};
      filter[sort] = filter.sortCheck;
      delete filter.sortCheck;
      limit =   params.limit;
      return CategoryModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return CategoryModel.find(condition).count().exec();
    }
  }


  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return CategoryModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return CategoryModel.findByIdAndRemove(id).exec()
    .then(() => {
      return true;
    });
  }
}

module.exports = CategoryBusiness;
