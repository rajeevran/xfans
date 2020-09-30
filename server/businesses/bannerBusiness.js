import { BannerModel } from '../models';
import { BannerEvent } from '../events';
import keys from '../config/keys';

class BannerBusiness {
  /**
   * create a new Banner
   * @param  {Object} data Banner data
   * @return {Promise}
   */
  static create(data,user) {
    var newBanner = new BannerModel(data);
    newBanner.user = user._id;
    return newBanner.save().then((banner) => {
      //fire event to another sides
      BannerEvent.emit(keys.BANNER_CREATED, banner);
      return banner;
    });
  }

  /**
   * update Banner
   * @param  {Object} Mongoose Banner object
   * @return {Promise}
   */
  static update(banner) {
    return banner.save();
  }

  /**
   * Update all data by query
   * @param  {Object} data Banner data
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
   * find list of Banners
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
    if(params.type){
        condition.type = params.type;
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
      return BannerModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return BannerModel.find(condition).count().exec();
    }
  }


  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return BannerModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return BannerModel.findByIdAndRemove(id).exec()
    .then(() => {
      BannerEvent.emit(keys.BANNER_DELETED, id);

      return true;
    });
  }
}

module.exports = BannerBusiness;
