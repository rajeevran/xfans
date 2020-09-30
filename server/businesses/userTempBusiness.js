import { UserTempModel } from '../models';
import { UserTempEvent } from '../events';
import keys from '../config/keys';

class UserTempBusiness {
  /**
   * create a new UserTemp
   * @param  {Object} data UserTemp data
   * @return {Promise}
   */
  static create(data) {
    var newUserTemp = new UserTempModel(data);
    return newUserTemp.save().then((userTemp) => {
      //fire event to another sides
      //UserTempEvent.emit(keys.BOOKMARK_CREATED, userTemp);
      return userTemp;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update UserTemp
   * @param  {Object} Mongoose UserTemp object
   * @return {Promise}
   */
  static update(userTemp) {
    return userTemp.save().then((updated) => {
     // UserTempEvent.emit(keys.BOOKMARK_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data UserTemp data
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
   * find list of UserTemps
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(user) {
    return UserTempModel.find({user:user._id}).exec();
  }

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return UserTempModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return UserTempModel.findByIdAndRemove(id).exec()
    .then(() => {
      UserTempEvent.emit(keys.BOOKMARK_DELETED, id);

      return true;
    });
  }
}

module.exports = UserTempBusiness;
