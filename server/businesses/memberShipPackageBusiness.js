import { MemberShipPackageModel } from '../models';
import { MemberShipPackageEvent } from '../events';
import keys from '../config/keys';

class MemberShipPackageBusiness {
  /**
   * create a new MemberShipPackage
   * @param  {Object} data MemberShipPackage data
   * @return {Promise}
   */
  static create(data,user) {
    var newMemberShipPackage = new MemberShipPackageModel(data);
    newMemberShipPackage.user = user._id;
    return newMemberShipPackage.save().then((memberShipPackage) => {
      //fire event to another sides
      MemberShipPackageEvent.emit(keys.BANNER_CREATED, memberShipPackage);
      return memberShipPackage;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update MemberShipPackage
   * @param  {Object} Mongoose MemberShipPackage object
   * @return {Promise}
   */
  static update(memberShipPackage) {
    return memberShipPackage.save().then((updated) => {
      //MemberShipPackageEvent.emit(keys.BANNER_UPDATED, updated);
      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data MemberShipPackage data
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
   * find list of MemberShipPackages
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params) {
    var ObjectId = require('mongoose').Types.ObjectId; 
    var condition = {};
    var limit = 0;
    var sort = 'order';
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
      return MemberShipPackageModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return MemberShipPackageModel.find(condition).count().exec();
    }    
  }
  

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return MemberShipPackageModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return MemberShipPackageModel.findByIdAndRemove(id).exec()
    .then(() => {
      MemberShipPackageEvent.emit(keys.BANNER_DELETED, id);

      return true;
    });
  }
}

module.exports = MemberShipPackageBusiness;
