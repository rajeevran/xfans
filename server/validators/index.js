import _ from 'lodash';
import UserValidator from './userValidator';
import UserTempValidator from './userTempValidator';
import VideoValidator from './videoValidator';
import ProductValidator from './productValidator';
import MemberShipPackageValidator from './memberShipPackageValidator';
import PerformerValidator from './performerValidator';
import CommentValidator from './commentValidator';
import NotificationValidator from './notificationValidator';
import OrderValidator from './orderValidator';
import BookmarkValidator from './bookmarkValidator';
import PhotoValidator from './photoValidator';
import SaveVideoValidator from './saveVideoValidator';
import BannerValidator from './bannerValidator';
import PageValidator from './pageValidator';
import SettingValidator from './settingValidator';
import CategoryValidator from './categoryValidator';
import PayoutValidator from './payoutValidator';

import GUserValidator from './getMyContent/userValidator';


let parseJoiError = (err) => {
	let errors = {};
  _.map(err.details, e => {
  	if(!errors[e.path]) {
  		errors[e.path] = [];
  	}
    errors[e.path].push(e.message);
  });
  return errors;
};

export {
	parseJoiError,
	UserValidator,
  VideoValidator,
  ProductValidator,
  MemberShipPackageValidator,
  PerformerValidator,
  CommentValidator,
  NotificationValidator,
  OrderValidator,
  BookmarkValidator,
  PhotoValidator,
  UserTempValidator,
  SaveVideoValidator,
  BannerValidator,
  PageValidator,
  CategoryValidator,
  SettingValidator,
  PayoutValidator,
  GUserValidator
};
