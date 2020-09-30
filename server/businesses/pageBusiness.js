import { PageModel } from '../models';
import { PageEvent } from '../events';
import keys from '../config/keys';

class PageBusiness {
  /**
   * create a new Page
   * @param  {Object} data Page data
   * @return {Promise}
   */
  static create(data,user) {
    var newPage = new PageModel(data);
    newPage.user = user._id;
    return newPage.save().then((page) => {
      //fire event to another sides
      PageEvent.emit(keys.PAGE_CREATED, page);
      return page;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Page
   * @param  {Object} Mongoose Page object
   * @return {Promise}
   */
  static update(page) {
    return page.save();
  }

  /**
   * Update all data by query
   * @param  {Object} data Page data
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
   * find list of Pages
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params) {
    var ObjectId = require('mongoose').Types.ObjectId; 
    var condition = {};
    var limit = 0;
    var sort = 'createdAt';
    var order = -1;
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
    if(params.limit !== 'undefined'){
      var filter = { sortCheck : order};
      filter[sort] = filter.sortCheck;
      delete filter.sortCheck;
      limit =   params.limit;
      return PageModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return PageModel.find(condition).count().exec();
    }    
  }
  

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return PageModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return PageModel.findByIdAndRemove(id).exec()
    .then(() => {
      PageEvent.emit(keys.PAGE_DELETED, id);

      return true;
    });
  }
}

module.exports = PageBusiness;
