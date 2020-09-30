import { SaveVideoModel } from '../models';
import { SaveVideoEvent } from '../events';
import keys from '../config/keys';

class SaveVideoBusiness {
  /**
   * create a new saveVideo
   * @param  {Object} data saveVideo data
   * @return {Promise}
   */
  static create(data,user,type) {
    var mongoose = require('mongoose');
    var newsaveVideo = new SaveVideoModel();
    newsaveVideo.video = mongoose.Types.ObjectId(data._id);
    newsaveVideo.user = mongoose.Types.ObjectId(user._id);
    newsaveVideo.type = type;
    return newsaveVideo.save().then((saveVideo) => {
      //fire event to another sides
      saveVideoEvent.emit(keys.SAVEVIDEO_CREATED, saveVideo);
      return saveVideo;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update saveVideo
   * @param  {Object} Mongoose saveVideo object
   * @return {Promise}
   */
  static update(saveVideo) {
    return saveVideo.save().then((updated) => {
      saveVideoEvent.emit(keys.SAVEVIDEO_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data saveVideo data
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
   * find list of saveVideos
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params,user) {
    var ObjectId = require('mongoose').Types.ObjectId; 
    var condition ={
        user: new ObjectId(user._id),
        type:params.type
      }
     
    if(params.limit != 'undefined'){
      return SaveVideoModel.find(condition).sort({ 'createdAt': -1 }).populate('video').skip(params.offset*params.limit).limit(params.limit).exec();
    }else{
      return SaveVideoModel.find(condition).count().exec();
    }   
  }
  

  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    console.log(params)
    return SaveVideoModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return SaveVideoModel.findByIdAndRemove(id).exec()
    .then(() => {
//      saveVideoEvent.emit(keys.SAVEVIDEO_DELETED, id);

      return true;
    });
  }
}

module.exports = SaveVideoBusiness;
