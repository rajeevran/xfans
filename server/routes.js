/**
 * Main application routes
 */

"use strict";

import errors from "./components/errors";
import path from "path";
import * as auth from "./auth/auth.service";
import userController from "./api/v1/userController";
import videoController from "./api/v1/videoController";
import productController from "./api/v1/productController";
import memberShipPackageController from "./api/v1/memberShipPackageController";
import performerController from "./api/v1/performerController";
import commentController from "./api/v1/commentController";
import notificationController from "./api/v1/notificationController";
import orderController from "./api/v1/orderController";
import bookmarkController from "./api/v1/bookmarkController";
import photoController from "./api/v1/photoController";
import userTempController from "./api/v1/userTempController";
import saveVideoController from "./api/v1/saveVideoController";
import bannerController from "./api/v1/bannerController";
import pageController from "./api/v1/pageController";
import settingController from "./api/v1/settingController";
import categoryController from "./api/v1/categoryController";
import productCategoryController from "./api/v1/productCategoryController";
import paypalController from "./api/v1/paypalController";
import bitpayController from "./api/v1/bitpayController";
import couponController from "./api/v1/couponController";
import searchController from "./api/v1/searchController";
import albumController from "./api/v1/albumController";
import payoutController from "./api/v1/payoutController";
import messageController from "./api/v1/messageController";
import subscriptionController from "./api/v1/subscriptionController";
import earningController from "./api/v1/earningController";
import fileController from "./api/v1/fileController";
import requestLogController from "./api/v1/requestLogController";
import paymentController from "./api/v1/paymentController";
import blockPerformerController from "./api/v1/blockPerformerController";
import oauthController from "./api/v1/oauthController";
import calendarController from "./api/v1/calendarController";
import affiliateContentController from "./api/v1/affiliateContentController";
import affiliateAccountController from "./api/v1/affiliateAccountController";
import guserController from "./api/v1/getMyContent/guserController";

import multer from "multer";
import config from "./config/environment";
import { StringHelper } from "./helpers";

import geoBusiness from "./businesses/geoBusiness";
import geoCtrl from "./api/v1/geo.controller";

var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, config.fileTempFolder);
  },

  filename: function(req, file, cb) {
    let name =
      StringHelper.randomString(7) +
      "_" +
      StringHelper.getFileName(file.originalname);

    cb(null, name);
  }
});
var upload = multer({
  storage
});

function validateAdminOrPerformer(req, res, next) {
  if (req.user.role !== "admin" && !req.isPerformer) {
    return res.status(403).end();
  }

  next();
}

var whiteListIps = ["0.0.0.1"];
const checkBlocked = function(req, res, next) {
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (whiteListIps.indexOf(ip) > -1 || ip.indexOf('64.38.212') > -1 || ip.indexOf('64.38.215') > -1 || ip.indexOf('64.38.240') > -1 || ip.indexOf('64.38.241') > -1) {
    return next();
  }
  geoBusiness.checkBlocked(ip, function(err, blocked) {
    if (err || blocked) {
      return res.status(403).send();
    }

    return next();
  });
};

export default function(app) {
  app.use("*", checkBlocked);

  // Insert routes below
  app.get("/api/v1/users/me", auth.isAuthenticated(), userController.me);
  app.put(
    "/api/v1/users/password",
    auth.isAuthenticated(),
    userController.changePassword
  );
  app.put(
    "/api/v1/users/:id/update-profile",
    auth.isAuthenticated(),
    userController.updateProfile
  );
  app.post(
    "/api/v1/users/photo",
    auth.isAuthenticated(),
    multipartMiddleware,
    userController.updatePhoto
  );
  app.post(
    "/api/v1/users",
    auth.loadUser(),
    multipartMiddleware,
    userController.create
  );
  app.post(
    "/api/v1/users/download",
    auth.isAuthenticated(),
    userController.downloadVideo
  );
  app.post(
    "/api/v1/users/favorite",
    auth.isAuthenticated(),
    userController.favoriteVideo
  );
  app.put(
    "/api/v1/users/favorite",
    auth.isAuthenticated(),
    userController.removeFavoriteVideo
  );
  app.post(
    "/api/v1/users/watch-later",
    auth.isAuthenticated(),
    userController.watchLaterVideo
  );
  app.put(
    "/api/v1/users/watch-later",
    auth.isAuthenticated(),
    userController.removeWatchLaterVideo
  );
  app.post("/api/v1/users/forgot", userController.forgot);
  app.delete(
    "/api/v1/users/:id",
    auth.hasRole("admin"),
    userController.destroy
  );
  app.get("/api/v1/users/:id", auth.hasRole("admin"), userController.show);
  app.put(
    "/api/v1/users/:id",
    auth.hasRole("admin"),
    multipartMiddleware,
    userController.update
  );
  app.get("/api/v1/users", auth.hasRole("admin"), userController.index);
  app.get("/api/v1/users/check/uservip", userController.checkVip);
  app.get(
    "/api/v1/users/subscribers/performers",
    auth.loadUser(),
    subscriptionController.getSubscribedPerformers
  );
  app.get("/api/v1/users/verifyEmail/:token", userController.verifyEmail);
  app.use("/auth", require("./auth"));

  //Create User Temp
  app.post("/api/v1/userTemps", userTempController.create);

  //CURD Video
  app.post(
    "/api/v1/videos",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    videoController.create
  );
  app.post("/api/v1/videos/like", auth.isAuthenticated(), videoController.like);
  app.get(
    "/api/v1/videos",
    auth.loadUser(),
    performerController.findOneMiddleware,
    videoController.index
  );
  app.get(
    "/api/v1/videos/folder",
    auth.hasRole("admin"),
    videoController.folder
  );
  app.put(
    "/api/v1/videos/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    videoController.update
  );
  app.delete(
    "/api/v1/videos/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    videoController.destroy
  );
  app.get("/api/v1/videos/search", videoController.search);
  app.get("/api/v1/videos/topvideos", videoController.topVideos);
  app.get("/api/v1/videos/tags", videoController.tagsHint);
  app.get("/api/v1/videos/:id", videoController.show);
  app.get(
    "/api/v1/videos/:id/checkBuy",
    auth.isAuthenticated(),
    videoController.checkBuySaleVideo
  );
  app.get(
    "/api/v1/videos/:id/adminCheckBuy",
    auth.hasRole("admin"),
    videoController.adminCheckBuySaleVideo
  );
  app.get("/api/v1/videos/:id/related", videoController.getRelatedVideos);
  app.get(
    "/api/v1/videos/showWithUploader/:id",
    videoController.showWithUploader
  );
  app.put("/api/v1/videos/:id/view", videoController.increaseTotalView);
  app.post(
    "/api/v1/videos/:id/tweet",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    videoController.tweet
  );

  //CURD Photo
  app.post(
    "/api/v1/photos",
    auth.isAuthenticated(),
    multipartMiddleware,
    photoController.create
  );
  app.get("/api/v1/photos", photoController.index);
  app.get("/api/v1/photos/all", photoController.all);
  app.put(
    "/api/v1/photos/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    photoController.update
  );
  app.delete(
    "/api/v1/photos/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    photoController.destroy
  );
  app.get("/api/v1/photos/search", auth.loadUser(), photoController.search);
  app.get("/api/v1/photos/:id", auth.loadUser(), photoController.show);

  //CURD Banner
  app.post(
    "/api/v1/banners",
    auth.hasRole("admin"),
    multipartMiddleware,
    bannerController.create
  );
  app.get("/api/v1/banners", bannerController.index);
  app.put(
    "/api/v1/banners/:id",
    auth.hasRole("admin"),
    multipartMiddleware,
    bannerController.update
  );
  app.delete(
    "/api/v1/banners/:id",
    auth.hasRole("admin"),
    bannerController.destroy
  );
  app.get("/api/v1/banners/:id", bannerController.show);

  //CURD Page
  app.post(
    "/api/v1/pages",
    auth.hasRole("admin"),
    multipartMiddleware,
    pageController.create
  );
  app.get("/api/v1/pages", pageController.index);
  app.put(
    "/api/v1/pages/:id",
    auth.hasRole("admin"),
    multipartMiddleware,
    pageController.update
  );
  app.delete(
    "/api/v1/pages/:id",
    auth.hasRole("admin"),
    pageController.destroy
  );
  app.get("/api/v1/pages/:id", pageController.show);

  //CURD Request Payout
  app.get(
    "/api/v1/payouts/search",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    payoutController.search
  );
  app.get(
    "/api/v1/payouts",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    payoutController.list
  );
  app.post(
    "/api/v1/payouts",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    payoutController.create
  );
  app.get(
    "/api/v1/payouts/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    payoutController.show
  );
  app.put(
    "/api/v1/payouts/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    payoutController.update
  );
  app.delete(
    "/api/v1/payouts/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    payoutController.destroy
  );

  //CURD Categories
  app.post(
    "/api/v1/categories",
    auth.hasRole("admin"),
    multipartMiddleware,
    categoryController.create
  );
  app.get("/api/v1/categories", categoryController.index);
  app.put(
    "/api/v1/categories/:id",
    auth.hasRole("admin"),
    multipartMiddleware,
    categoryController.update
  );
  app.delete(
    "/api/v1/categories/:id",
    auth.hasRole("admin"),
    categoryController.destroy
  );
  app.get("/api/v1/categories/:id", categoryController.show);

  //CURD Setting
  app.get("/api/v1/settings", auth.hasRole("admin"), settingController.index);
  app.put(
    "/api/v1/settings/:id",
    auth.hasRole("admin"),
    multipartMiddleware,
    settingController.update
  );
  app.get(
    "/api/v1/settings/:id",
    auth.hasRole("admin"),
    settingController.show
  );
  app.get("/api/v1/settings/get/full", settingController.getSetting);
  app.post("/api/v1/settings/contact", settingController.contact);

  //CURD Product
  app.post(
    "/api/v1/products",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    productController.create
  );
  app.get("/api/v1/products", productController.index);
  app.get("/api/v1/products/search/store", productController.search);
  app.put(
    "/api/v1/products/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    productController.update
  );
  app.delete(
    "/api/v1/products/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    productController.destroy
  );
  app.get("/api/v1/products/count", productController.countAllProducts);
  app.get("/api/v1/products/:id", productController.show);

  //Save Video
  app.post(
    "/api/v1/saveVideos",
    auth.isAuthenticated(),
    saveVideoController.create
  );
  app.get(
    "/api/v1/saveVideos",
    auth.isAuthenticated(),
    saveVideoController.index
  );
  app.put(
    "/api/v1/saveVideos/:id",
    auth.isAuthenticated(),
    saveVideoController.update
  );
  app.delete(
    "/api/v1/saveVideos/:id",
    auth.isAuthenticated(),
    saveVideoController.destroy
  );
  app.get(
    "/api/v1/saveVideos/:id",
    auth.isAuthenticated(),
    saveVideoController.show
  );

  //CURD Member Ship Package
  app.post(
    "/api/v1/memberShipPackages",
    auth.hasRole("admin"),
    multipartMiddleware,
    memberShipPackageController.create
  );
  app.get("/api/v1/memberShipPackages", memberShipPackageController.index);
  app.put(
    "/api/v1/memberShipPackages/:id",
    auth.hasRole("admin"),
    multipartMiddleware,
    memberShipPackageController.update
  );
  app.delete(
    "/api/v1/memberShipPackages/:id",
    auth.hasRole("admin"),
    memberShipPackageController.destroy
  );
  app.get("/api/v1/memberShipPackages/:id", memberShipPackageController.show);

  //register for performer getMyContent
  app.post("/api/v1/performers/register", performerController.register);
  app.post(
    "/api/v1/performers/register/upload",
    upload.single("file"),
    performerController.uploadVerifyImage
  );

  //CURD Performer
  app.post(
    "/api/v1/performers",
    auth.isAuthenticated(),
    multipartMiddleware,
    performerController.create
  );
  app.get("/api/v1/performers", performerController.index);
  app.delete(
    "/api/v1/performers/:id",
    auth.hasRole("admin"),
    performerController.destroy
  );
  app.get("/api/v1/performers/leaderboards", performerController.leaderboards);
  app.get("/api/v1/performers/search", performerController.search);
  app.get("/api/v1/performers/:id", performerController.show);
  app.get(
    "/api/v1/performers/admin/:id",
    auth.hasRole("admin"),
    performerController.showAdmin
  );
  app.post(
    "/api/v1/performers/avatar",
    auth.isAuthenticated(),
    upload.single("file"),
    performerController.uploadAvatar
  );
  app.put(
    "/api/v1/performers/password",
    auth.isAuthenticated(),
    performerController.updatePassword
  );
  app.put(
    "/api/v1/performers/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    performerController.update
  );
  app.put(
    "/api/v1/performers/:id/view",
    auth.loadUser(),
    performerController.addViewCount
  );
  app.get(
    "/api/v1/performers/files/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    performerController.getIdFile
  );
  app.get(
    "/api/v1/performers/check/allow",
    auth.isAuthenticated(),
    performerController.checkAllow
  );
  app.get(
    "/api/v1/performers/verifyEmail/:token",
    performerController.verifyEmail
  );

  //CURD Comment
  app.post(
    "/api/v1/comments",
    auth.isAuthenticated(),
    commentController.create
  );
  app.post(
    "/api/v1/comments/type",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    commentController.createWithType
  );
  app.get("/api/v1/comments", commentController.index);
  app.get(
    "/api/v1/comments/search",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    commentController.searchByType
  );
  app.put(
    "/api/v1/comments/:id",
    auth.isAuthenticated(),
    commentController.update
  );
  app.delete(
    "/api/v1/comments/:id",
    auth.isAuthenticated(),
    commentController.destroy
  );
  app.get("/api/v1/comments/:id", commentController.show);

  //CURD Notification
  app.post(
    "/api/v1/notifications",
    auth.isAuthenticated(),
    notificationController.create
  );
  app.get("/api/v1/notifications", notificationController.index);
  app.put(
    "/api/v1/notifications/:id",
    auth.isAuthenticated(),
    notificationController.update
  );
  app.delete(
    "/api/v1/notifications/:id",
    auth.isAuthenticated(),
    notificationController.destroy
  );
  app.get("/api/v1/notifications/:id", notificationController.show);

  //CURD Bookmark
  app.post(
    "/api/v1/bookmarks",
    auth.isAuthenticated(),
    bookmarkController.create
  );
  app.get(
    "/api/v1/bookmarks",
    auth.isAuthenticated(),
    bookmarkController.index
  );
  app.put(
    "/api/v1/bookmarks/:id",
    auth.isAuthenticated(),
    bookmarkController.update
  );
  app.delete(
    "/api/v1/bookmarks/:id",
    auth.isAuthenticated(),
    bookmarkController.destroy
  );
  app.get(
    "/api/v1/bookmarks/:id",
    auth.isAuthenticated(),
    bookmarkController.show
  );

  //CURD Order
  app.post("/api/v1/orders", auth.isAuthenticated(), orderController.create);
  app.post(
    "/api/v1/orders/admin",
    auth.hasRole("admin"),
    orderController.adminCreate
  );
  app.get("/api/v1/orders", auth.isAuthenticated(), orderController.index);
  app.get(
    "/api/v1/search/orders",
    auth.isAuthenticated(),
    orderController.search
  );
  app.put("/api/v1/orders/:id", auth.isAuthenticated(), orderController.update);
  app.delete(
    "/api/v1/orders/:id",
    auth.isAuthenticated(),
    orderController.destroy
  );
  app.get("/api/v1/orders/:id", orderController.show);

  //Update Member Ship
  app.post(
    "/payment-success",
    requestLogController.log,
    userController.updateMemberShip
  );
  app.post("/buy-success", requestLogController.log, userController.payment);

  app.post(
    "/api/v1/product-categories",
    auth.hasRole("admin"),
    productCategoryController.create
  );
  app.put(
    "/api/v1/product-categories/:id",
    auth.hasRole("admin"),
    productCategoryController.middlewares.findOne,
    productCategoryController.update
  );
  app.delete(
    "/api/v1/product-categories/:id",
    auth.hasRole("admin"),
    productCategoryController.middlewares.findOne,
    productCategoryController.delete
  );
  app.get(
    "/api/v1/product-categories",
    auth.loadUser(),
    productCategoryController.list
  );
  app.get(
    "/api/v1/product-categories/:id",
    productCategoryController.middlewares.findOne,
    productCategoryController.findOne
  );
  //payment by paypal
  app.post(
    "/api/v1/paypal/payment",
    auth.isAuthenticated(),
    paypalController.init,
    paypalController.doDirectPayment
  );
  app.post(
    "/api/v1/paypal/signup",
    paypalController.init,
    paypalController.doDirectPayment
  );
  app.post(
    "/api/v1/paypal/callback",
    paypalController.init,
    paypalController.updateTransaction
  );

  //payment by bitpay
  app.post(
    "/api/v1/bitpay/payment",
    auth.isAuthenticated(),
    bitpayController.init,
    bitpayController.doDirectPayment
  );
  app.post(
    "/api/v1/bitpay/signup",
    bitpayController.init,
    bitpayController.doDirectPayment
  );
  app.post(
    "/api/v1/bitpay/callback",
    bitpayController.init,
    bitpayController.updateTransaction
  );

  app.post("/api/v1/coupons", auth.hasRole("admin"), couponController.create);
  app.put(
    "/api/v1/coupons/:id",
    auth.hasRole("admin"),
    couponController.middlewares.findOne,
    couponController.update
  );
  app.delete(
    "/api/v1/coupons/:id",
    auth.hasRole("admin"),
    couponController.middlewares.findOne,
    couponController.delete
  );
  app.get("/api/v1/coupons", auth.hasRole("admin"), couponController.list);
  app.get(
    "/api/v1/coupons/:id",
    auth.hasRole("admin"),
    couponController.middlewares.findOne,
    couponController.findOne
  );
  app.get("/api/v1/coupon", couponController.findByCode);

  app.get("/api/v1/search/stats", searchController.stats);
  app.get("/api/v1/search", searchController.findItems);

  app.post(
    "/api/v1/albums",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    albumController.create
  );
  app.put(
    "/api/v1/albums/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    albumController.middlewares.findOne,
    albumController.update
  );
  app.delete(
    "/api/v1/albums/:id",
    auth.isAuthenticated(),
    albumController.middlewares.findOne,
    albumController.delete
  );
  app.get("/api/v1/albums", albumController.list);
  app.get(
    "/api/v1/albums/all",
    performerController.findOneMiddleware,
    albumController.findAllPerfomerAlbums
  );
  app.get("/api/v1/albums/count", albumController.countAllAlbums);
  app.get(
    "/api/v1/albums/:id",
    albumController.middlewares.findOne,
    albumController.findOne
  );

  //block chat module
  app.post(
    "/api/v1/blocks",
    auth.isAuthenticated(),
    blockPerformerController.create
  );
  app.delete(
    "/api/v1/blocks/:id",
    auth.isAuthenticated(),
    blockPerformerController.middlewares.findOne,
    blockPerformerController.delete
  );
  app.get(
    "/api/v1/blocks",
    auth.isAuthenticated(),
    blockPerformerController.list
  );
  app.get(
    "/api/v1/blocks/check",
    auth.isAuthenticated(),
    blockPerformerController.checkBlock
  );

  //messages module
  app.post(
    "/api/v1/messages/groups",
    auth.isAuthenticated(),
    messageController.createGroup
  );
  app.get(
    "/api/v1/messages/groups",
    auth.isAuthenticated(),
    messageController.getAllGroups
  );
  app.post(
    "/api/v1/messages",
    auth.isAuthenticated(),
    messageController.createMessage
  );
  app.post(
    "/api/v1/messages/image",
    auth.isAuthenticated(),
    multipartMiddleware,
    messageController.sendImage
  );
  app.put(
    "/api/v1/messages/:id/read",
    auth.isAuthenticated(),
    messageController.findMessage,
    messageController.readMessage
  );
  app.get(
    "/api/v1/messages/groups/:id",
    auth.isAuthenticated(),
    messageController.getMessagesInGroup
  );

  //subscription
  app.get(
    "/api/v1/subscriptions/check/:performerId",
    auth.isAuthenticated(),
    subscriptionController.checkSubscribe
  );
  app.get(
    "/api/v1/subscriptions/subscribers/count/:performerId",
    subscriptionController.countByPerformer
  );
  app.get(
    "/api/v1/subscriptions/subscribers/performers",
    auth.loadUser(),
    subscriptionController.getSubscribedPerformers
  );
  app.post(
    "/api/v1/subscriptions/add",
    auth.hasRole("admin"),
    subscriptionController.updateSubcribe
  );

  app.get(
    "/api/v1/earning/search",
    auth.isAuthenticated(),
    earningController.search
  );
  app.get(
    "/api/v1/earning/stats",
    auth.isAuthenticated(),
    earningController.stats
  );
  app.put(
    "/api/v1/earning/paid",
    auth.hasRole("admin"),
    earningController.updatePaidPerformer
  );

  app.get("/api/v1/subscribers", subscriptionController.subscribers);

  app.post(
    "/api/v1/files/upload",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    fileController.uploadFile
  );
  app.post(
    "/api/v1/files/video",
    multipartMiddleware,
    fileController.uploadVideoFile
  );
  app.post(
    "/api/v1/files/video-welcome",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    fileController.uploadAndConvertVideoToStore
  );

  app.get(
    "/api/v1/stats/profile-view",
    auth.isAuthenticated(),
    performerController.profileViewStats
  );
  app.get(
    "/api/v1/stats/subscribers",
    auth.isAuthenticated(),
    subscriptionController.stats
  );
  app.get(
    "/api/v1/stats/comments",
    auth.isAuthenticated(),
    commentController.stats
  );
  app.get(
    "/api/v1/stats/like",
    auth.isAuthenticated(),
    performerController.likeStats
  );

  app.get(
    "/api/v1/twitter/connect",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    oauthController.twitterConnect
  );
  app.get("/api/v1/twitter/callback", oauthController.twitterCallback);

  app.post(
    "/api/v1/payment/ccbill",
    auth.isAuthenticated(),
    paymentController.subscribeCCBill
  );
  app.post(
    "/api/v1/ccbill/hook",
    requestLogController.log,
    paymentController.doCCBillCallhook
  );

  app.get(
    "/api/v1/calendar",
    auth.isAuthenticated(),
    calendarController.getCalendar
  );
  app.get(
    "/api/v1/calendar/events",
    auth.isAuthenticated(),
    calendarController.list
  );
  app.post(
    "/api/v1/calendar",
    auth.isAuthenticated(),
    calendarController.create
  );
  app.put(
    "/api/v1/calendar/:id",
    auth.isAuthenticated(),
    calendarController.middlewares.findOne,
    calendarController.update
  );
  app.delete(
    "/api/v1/calendar/:id",
    auth.isAuthenticated(),
    calendarController.middlewares.findOne,
    calendarController.delete
  );
  app.get(
    "/api/v1/calendar/:id",
    auth.isAuthenticated(),
    calendarController.middlewares.findOne,
    calendarController.findOne
  );

  app.post(
    "/api/v1/affiliateContent",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    requestLogController.log,
    affiliateContentController.upload
  );
  app.get(
    "/api/v1/affiliateContent/search",
    auth.loadUser(),
    auth.isAffiliate(),
    affiliateContentController.search
  );
  app.get(
    "/api/v1/affiliateContent/performers",
    auth.loadUser(),
    auth.isAffiliate(),
    affiliateContentController.performers
  );
  app.get(
    "/api/v1/affiliateContent/:id",
    auth.loadUser(),
    auth.isAffiliate(),
    affiliateContentController.show
  );
  app.delete(
    "/api/v1/affiliateContent/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    affiliateContentController.delete
  );
  app.put(
    "/api/v1/affiliateContent/:id",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    requestLogController.log,
    affiliateContentController.update
  );
  app.post(
    "/api/v1/affiliateContent/:id/update",
    auth.isAuthenticated(),
    validateAdminOrPerformer,
    multipartMiddleware,
    requestLogController.log,
    affiliateContentController.update
  );

  app.post(
    "/api/v1/affiliateAccount",
    auth.hasRole("admin"),
    affiliateAccountController.create
  );
  app.put(
    "/api/v1/affiliateAccount/:id",
    auth.hasRole("admin"),
    affiliateAccountController.update
  );
  app.get(
    "/api/v1/affiliateAccount/search",
    auth.hasRole("admin"),
    affiliateAccountController.search
  );
  app.get(
    "/api/v1/affiliateAccount/:id",
    auth.hasRole("admin"),
    affiliateAccountController.show
  );
  app.post("/api/v1/affiliateAccount/login", affiliateAccountController.login);
  app.get(
    "/api/v1/affiliateAccount/me",
    auth.isAffiliate(),
    affiliateAccountController.me
  ); // ko can thiet

  app.get(
    "/api/v1/geo/countries-block",
    auth.hasRole("admin"),
    geoCtrl.getBlockList
  );
  app.post(
    "/api/v1/geo/countries-block",
    auth.hasRole("admin"),
    geoCtrl.addCountry
  );
  app.delete(
    "/api/v1/geo/countries-block/:code",
    auth.hasRole("admin"),
    geoCtrl.removeCountry
  );

  
  //register for performer 
  app.post(
    "/api/v1/getMyContent/users",
     guserController.create
     );

  app.post(
    "/api/v1/getMyContent/users/:id/update-profile",
    auth.isAuthenticated(),
    guserController.updateProfile
  );
  
  app.post(
    "/api/v1/users/:id",
    multipartMiddleware,
    guserController.update
  );

  app.post("/api/v1/server/reload", auth.hasRole("admin"), function(req, res) {
    var pm2Id = process.env.PM2_ID || 0;
    var cmd = `pm2 reload ${pm2Id}`;

    exec(cmd, function(error, stdout, stderr) {
      res.status(200).end();
    });
  });

  // All undefined asset or api routes should return a 404
  app
    .route(
      "/:url(api|auth|components|app|bower_components|assets|lib|styles)/*"
    )
    .get(errors[404]);
  app.get(/^\/backend(.*)$/, (req, res) => {
    res.sendFile(path.resolve("backend/index.html"));
  });
  // All other routes should redirect to the index.html
  app.route("/*").get((req, res) => {
    res.sendFile(path.resolve(app.get("appPath") + "/index.html"));
  });
}
