import { VideoModel } from '../models';
import { VideoEvent } from '../events';
import keys from '../config/keys';
import moment from 'moment';

class VideoBusiness {
  /**
   * create a new Video
   * @param  {Object} data Video data
   * @return {Promise}
   */
  static create(data,user) {
    if(data.type!=='upcoming'){
      data.isSchedule = false;
    }
    var newVideo = new VideoModel(data);
    newVideo.user = user._id;
    return newVideo.save().then((video) => {
      //fire event to another sides
      VideoEvent.emit(keys.VIDEO_CREATED, video);
      return video;
    })
    .catch(e => {
      //console.log(e);
    });
  }

  /**
   * update Video
   * @param  {Object} Mongoose Video object
   * @return {Promise}
   */
  static update(video) {
    if(video.type!=='upcoming'){
      video.isSchedule = false;
    }
    return video.save().then((updated) => {
      VideoEvent.emit(keys.VIDEO_UPDATED, updated);

      return updated;
    });
  }

  /**
   * Update all data by query
   * @param  {Object} data Video data
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
   * find list of Videos
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static find(params) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var condition = {};
    var limit = 0;
    var sort = 'activeDate';
    var order = -1;
    if(params.id != 'undefined' && params.type=='other'){
      condition = {
        _id: {$ne: new ObjectId(params.id)}
      }
    }else if(params.id != 'undefined' && params.type=='performer'){
      condition = {
        performer: new ObjectId(params.id)
      }
    }else if(params.type=='recent' || params.type=='upcoming') {
      if (!params.isAdmin) {
        if (params.type === 'upcoming') {
          condition = {
            $and: [
              {
                $or: [
                  {
                    type: params.type
                  },
                  {
                    isSchedule: true
                  }
                ]
              }
            ]
          };
          sort = 'schedule';
          order = 1;
        } else {
          condition = {
            type: params.type,
            isSchedule: {
              $ne: true
            }
          };
        }
      } else {
        condition = {
          type: params.type
        };
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
    if(typeof params.keyword != 'undefined' && params.keyword && params.sort != null){
      var regex = new RegExp(params.keyword, "i")
      condition = {'$or':[{name : regex}]};
    }
    if(typeof params.type != 'undefined' && params.type != '' && params.type!='performer' && params.type!='other'){
        condition.type = params.type;
    }
    if(params.categoryId){
      condition.categories = {$in: [new ObjectId(params.categoryId)]};
    }

    if (params.isSchedule && params.isAdmin) {
      condition.isSchedule = true;
    }
    // else if (!params.isAdmin) {
    //   condition.isSchedule = {
    //     $ne: true
    //   };
    // }

    if (params.performerId) {
      condition.performer = new ObjectId(params.performerId);
    }

    if (params.performer) {
      condition.performer = {
       $in: [new ObjectId(params.performer)]
      };
    }
    if (params.status) {
      condition.status = params.status;
    }

    if (params.startDate && params.endDate) {
      condition.createdAt = {
        $gte: moment(params.startDate).startOf('day').toDate(),
        $lte: moment(params.endDate).endOf('day').toDate()
      };
    }

    if (params.sort == 'mostLike') {
      sort = 'stats.totalLike';
    }else if(params.sort == 'mostView') {
      sort = 'stats.totalView';
    }

    if (params.isSaleVideo && ['false', '0'].indexOf(params.isSaleVideo) === -1) {
      condition.isSaleVideo = true;
      // condition.performer = new ObjectId(params.performerId);
    } else if (params.isSaleVideo) {
      condition.isSaleVideo = {
        $ne: true
      };
    }

    if (params.showHome) {
      condition.showHome = true;
    }

    if(params.limit !== 'undefined'){
      var filter = { sortCheck : order};
      filter[sort] = filter.sortCheck;
      delete filter.sortCheck;
      limit =   params.limit;
      return VideoModel.find(condition).sort(filter).skip(params.offset*limit).limit(params.limit).exec();
    }else{
      return VideoModel.count(condition).exec().then(function(num){
        return {total: num};
      });
    }
  }


  /**
   * find single record by params
   * @param  {Object} params Mongo query
   * @return {Promise}
   */
  static findOne(params) {
    return VideoModel.findOne(params).exec();
  }

  /**
   * delete account & fire delete event
   * @param  {String} id
   * @return {Promise}
   */
  static removeById(id) {
    return VideoModel.findByIdAndRemove(id).exec()
    .then(() => {
      VideoEvent.emit(keys.VIDEO_DELETED, id);

      return true;
    });
  }
}

module.exports = VideoBusiness;
