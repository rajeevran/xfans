import { PhotoModel } from '../models';
import { PhotoEvent } from '../events';
import keys from '../config/keys';

class PhotoBusiness {
  /**
   * create a new Photo
   * @param  {Object} data Photo data
   * @return {Promise}
   */
  static create(data,user) {
    var newPhoto = new PhotoModel(data);
    newPhoto.user = user ? user._id : null;

    return newPhoto.save().then((photo) => {
      //fire event to another sides
      PhotoEvent.emit(keys.PHOTO_CREATED, photo);
      return photo;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Photo
   * @param  {Object} Mongoose Photo object
   * @return {Promise}
   */
  static update(photo) {
    return photo.save();
  }

  /**
   * Update all data by query
   * @param  {Object} data Photo data
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
   * find list of Photos
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
    if(typeof params.type != 'undefined' && params.type=='performer'){
      condition = {
        performer: { "$in" : [new ObjectId(params.id)]}
      }
    }
    if(params.status=='active'){
        condition.status = params.status;
    }
    if(typeof params.keyword != 'undefined' && params.sort != null){
      var regex = new RegExp(params.keyword, "i")
      condition = {'$or':[{name : regex}]};
    }

    if(params.limit !== 'undefined'){
      var filter = { sortCheck : order };
      filter[sort] = filter.sortCheck;
      delete filter.sortCheck;
      limit =   params.limit;
      return PhotoModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return PhotoModel.find(condition).count().exec();
    }
  }


  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return PhotoModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return PhotoModel.findByIdAndRemove(id).exec()
    .then(() => {
      PhotoEvent.emit(keys.PHOTO_DELETED, id);

      return true;
    });
  }

  static uploadImages(){

  }
}

module.exports = PhotoBusiness;
