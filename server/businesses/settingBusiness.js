import { SettingModel } from '../models';
import { SettingEvent } from '../events';
import keys from '../config/keys';

class SettingBusiness {
  /**
   * create a new Setting
   * @param  {Object} data Setting data
   * @return {Promise}
   */
  static create(data,user) {
    var newSetting = new SettingModel(data);
    newSetting.user = user._id;
    return newSetting.save().then((setting) => {
      //fire event to another sides
      SettingEvent.emit(keys.SETTING_CREATED, setting);
      return setting;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Setting
   * @param  {Object} Mongoose Setting object
   * @return {Promise}
   */
  static update(setting) {
    return setting.save();
  }

  /**
   * Update all data by query
   * @param  {Object} data Setting data
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
   * find list of Settings
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
      return SettingModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return SettingModel.find(condition).count().exec();
    }
  }


  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return SettingModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return SettingModel.findByIdAndRemove(id).exec()
    .then(() => {
      SettingEvent.emit(keys.SETTING_DELETED, id);

      return true;
    });
  }
}

module.exports = SettingBusiness;
