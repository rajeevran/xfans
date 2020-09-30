import { CommentModel } from '../models';
import { CommentEvent } from '../events';
import keys from '../config/keys';

class CommentBusiness {
  /**
   * create a new Comment
   * @param  {Object} data Comment data
   * @return {Promise}
   */
  static create(data,type,user) {
    var newComment = new CommentModel(data);
    newComment.user = user._id;
    newComment.type = type;
    return newComment.save().then((comment) => {
      //fire event to another sides
      CommentEvent.emit(keys.COMMENT_CREATED, comment);
      comment = comment.toObject();
      comment.user = user;
      var promise = new Promise( function(resolve, reject) {
        resolve(comment);
      } );
      return promise;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * create a new Comment
   * @param  {Object} data Comment data of comment
   * @param  {String} performerId performer id
   *
   * @return {Promise}
   */
  static createCommentOfPerformer(data, performer) {
    var newComment = new CommentModel(data);

    newComment.type = 'payout';
    newComment.performer = performer._id;
    return newComment.save().then((comment) => {
      //fire event to another sides
      CommentEvent.emit(keys.COMMENT_CREATED, comment);

      var promise = new Promise( function(resolve, reject) {
        comment = comment.toObject();
        comment.user = performer;
        resolve(comment);
      } );

      return promise;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Comment
   * @param  {Object} Mongoose Comment object
   * @return {Promise}
   */
  static update(comment) {
    return comment.save().then((updated) => {
      CommentEvent.emit(keys.COMMENT_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data Comment data
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
   * find list of Comments
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var condition = {};
    if(params.status=='active'){
        condition.status = params.status;
    }
    if(params.id != 'undefined' && params.type=='other'){
      condition = {
      _id: {$ne: new ObjectId(params.id)}
      }
    }else if(params.id != 'undefined' && params.type=='video'){
      condition = {
        video: new ObjectId(params.id)
      }
    }

    if(params.limit != 'undefined'){
      return CommentModel.find(condition).sort({ 'createdAt': -1 }).populate('user','name photo').skip(params.offset*params.limit).limit(params.limit).exec();
    }else{
      return CommentModel.find().count().exec();
    }
  }

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return CommentModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return CommentModel.findByIdAndRemove(id).exec()
    .then(() => {
      CommentEvent.emit(keys.COMMENT_DELETED, id);

      return true;
    });
  }
}

module.exports = CommentBusiness;
