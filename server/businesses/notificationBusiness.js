import { NotificationModel } from '../models';
import { NotificationEvent } from '../events';
import keys from '../config/keys';

class NotificationBusiness {
  /**
   * create a new Notification
   * @param  {Object} data Notification data
   * @return {Promise}
   */
  static create(data,user) {
    var newNotification = new NotificationModel(data);
    newNotification.user = user._id;
    return newNotification.save().then((notification) => {
      //fire event to another sides
      NotificationEvent.emit(keys.NOTIFICATION_CREATED, notification);
      return notification;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Notification
   * @param  {Object} Mongoose Notification object
   * @return {Promise}
   */
  static update(notification) {
    return notification.save().then((updated) => {
      NotificationEvent.emit(keys.NOTIFICATION_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data Notification data
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
   * find list of Notifications
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(user) {
    return NotificationModel.find().exec();
  }

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return NotificationModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return NotificationModel.findByIdAndRemove(id).exec()
    .then(() => {
      NotificationEvent.emit(keys.NOTIFICATION_DELETED, id);

      return true;
    });
  }
}

module.exports = NotificationBusiness;
