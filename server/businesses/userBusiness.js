import { UserModel } from '../models';
import { UserEvent } from '../events';
import keys from '../config/keys';

class UserBusiness {
  /**
   * create a new user
   * @param  {Object} data user data
   * @return {Promise}
   */
  static create(data) {
    var newUser = new UserModel(data);
    return newUser.save().then((user) => {
      //fire event to another sides
      UserEvent.emit(keys.USER_CREATED, user);

      return user;
    });
  }

  /**
   * update user
   * @param  {Object} Mongoose user object
   * @return {Promise}
   */
  static update(user) {
    return user.save().then((updated) => {
      UserEvent.emit(keys.USER_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data user data
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
   * find list of users
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params) {
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
      condition = {'$or':[{name : regex},{email : regex}]};
    }
    if(params.limit !== 'undefined'){
      var filter = { sortCheck : order};
      filter[sort] = filter.sortCheck;
      delete filter.sortCheck;
      limit =   params.limit;
      return UserModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return UserModel.find(condition).count().exec();
    }

  }

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return UserModel.findOne(params, '-salt -password').exec();
  }

  static findOneByAdmin(params) {
    return UserModel.findOne(params).exec();
  }

  static forgotPassword(params,newPass) {
    return UserModel.findOne(params, '-salt -password').exec().then((user) => {
         user.password = newPass;
         UserBusiness.update(user)
          .then((user) => {
            UserEvent.emit(keys.USER_FORGOT, user);

          });
          return user;
    });
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return UserModel.findByIdAndRemove(id).exec()
    .then(() => {
      UserEvent.emit(keys.USER_DELETED, id);

      return true;
    });
  }
}

module.exports = UserBusiness;
