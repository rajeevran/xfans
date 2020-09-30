import { PerformerModel } from '../models';
import { PerformerEvent } from '../events';
import keys from '../config/keys';

class PerformerBusiness {
  /**
   * create a new Performer
   * @param  {Object} data Performer data
   * @return {Promise}
   */
  static create(data,user) {
    var newPerformer = new PerformerModel(data);
    newPerformer.user = user._id;
    return newPerformer.save().then((performer) => {
      //fire event to another sides
      PerformerEvent.emit(keys.PERFORMER_CREATED, performer);
      return performer;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Performer
   * @param  {Object} Mongoose Performer object
   * @return {Promise}
   */
  static update(performer) {
    return performer.save().then((updated) => {
      PerformerEvent.emit(keys.PERFORMER_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data Performer data
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
   * find list of Performers
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params) {
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
    if(typeof params.keyword != 'undefined' && params.keyword){
      var regex = new RegExp(params.keyword, "i")
      condition.$or = [{
        name : regex
      }];
    }

    if (params.sex) {
      condition.sex = params.sex;
    }
    if (params.size) {
      condition.bust = new RegExp(params.size, "i");
    }

    if(params.limit !== 'undefined'){
      var filter = { sortCheck : order};
      filter[sort] = filter.sortCheck;
      delete filter.sortCheck;
      limit =   params.limit;
      return PerformerModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return PerformerModel.find(condition).count().exec();
    }
  }

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return PerformerModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return PerformerModel.findByIdAndRemove(id).exec()
    .then(() => {
      PerformerEvent.emit(keys.PERFORMER_DELETED, id);

      return true;
    });
  }
}

module.exports = PerformerBusiness;
