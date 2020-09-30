import { BookmarkModel } from '../models';
import { BookmarkEvent } from '../events';
import keys from '../config/keys';

class BookmarkBusiness {
  /**
   * create a new Bookmark
   * @param  {Object} data Bookmark data
   * @return {Promise}
   */
  static create(data,user) {
    var newBookmark = new BookmarkModel(data);
    newBookmark.user = user._id;
    return newBookmark.save().then((bookmark) => {
      //fire event to another sides
      BookmarkEvent.emit(keys.BOOKMARK_CREATED, bookmark);
      return bookmark;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Bookmark
   * @param  {Object} Mongoose Bookmark object
   * @return {Promise}
   */
  static update(bookmark) {
    return bookmark.save().then((updated) => {
      BookmarkEvent.emit(keys.BOOKMARK_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data Bookmark data
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
   * find list of Bookmarks
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(user) {
    return BookmarkModel.find({user:user._id}).exec();
  }

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return BookmarkModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return BookmarkModel.findByIdAndRemove(id).exec()
    .then(() => {
      BookmarkEvent.emit(keys.BOOKMARK_DELETED, id);

      return true;
    });
  }
}

module.exports = BookmarkBusiness;
