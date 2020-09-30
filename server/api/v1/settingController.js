'use strict';

import { SettingModel } from '../../models';
import { SettingBusiness } from '../../businesses';
import { SettingValidator, parseJoiError } from '../../validators';
import { S3, GM, Uploader, Mailer } from '../../components';
import config from '../../config/environment';
import _ from 'lodash';
import async from 'async';
import path from 'path';
import fs from 'fs';
import { UtilsHelper } from '../../helpers';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

class SettingController {
  /**
   * Get list of Settings
   */
  static index(req, res) {
    if (req.query.limit !== 'undefined') {
      req.query.limit = parseInt(req.query.limit);
    }
    if (req.query.offset !== 'undefined') {
      req.query.offset = parseInt(req.query.offset);
    }
    return SettingBusiness.find(req.query)
      .then(settings => {
        res.status(200).json(settings);
      })
      .catch(handleError(res));
  }

  /**
   * Get a single Setting
   */
  static show(req, res, next) {
    SettingBusiness.findOne({
        _id: req.params.id
      })
      .then(setting => {
        if (!setting) {
          return res.status(404).end();
        }
        res.json(setting);
      })
      .catch(err => next(err));
  }

  /**
   * Get a single Setting
   */
  static getSetting(req, res, next) {
    SettingBusiness.findOne()
      .then(setting => {
        //console.log(setting)
        if (!setting) {
          return res.status(404).end();
        }
        setting = setting.toObject();
        setting.paypalEnable = setting.paypal ? setting.paypal.enable : false;
        setting.bitpayEnable = setting.bitpay ? setting.bitpay.enable : false;
        delete setting.paypal;
        delete setting.bitpay;
        res.json(setting);
      })
      .catch(err => next(err));
  }

  /**
   * Get a single Setting
   */
  static update(req, res, next) {
    SettingBusiness.findOne({
      _id: req.params.id
    }).then(setting => {
      _.assign(setting, _.pick(req.body, [
        'metaTitle',
        'metaDescription',
        'metaKeyword',
        'companyName',
        'address',
        'email',
        'hotline',
        'clientAccnumSubscriptions',
        'clientSubaccSubscriptions',
        'formNameSubscriptions',
        'currencyCodeSubscriptions',
        'saltSubscriptions',
        'clientAccnumSingle',
        'clientSubaccSingle',
        'formNameSingle',
        'currencyCodeSingle',
        'saltSingle',
        'ccbillEnable',
        'welcomeTitle',
        'welcomeContent',
        'footerContent',
        'landingPageContent',
        'paypal',
        'bitpay',
        'mailchimp',
        'fullAccessVideoText',
        'color',
        'siteName',
        'tipCommision',
        'subscriptionCommision',
        'storeComission'
      ]));
      var dirImage = path.join(config.imageTempFolder + "/users/" + req.user._id);
      let Func = config.imageType == 's3' ? Uploader.uploadImageToS3 : Uploader.uploadImage;
      let uploadFunc = function(key, cb) {
        if (!req.files.file || !req.files.file[key]) {
          return cb();
        }

        Func(req.files.file[key], req.user._id, function(err, url) {
          if (!err) {
            if (key === 'fullAccessVideoTextIcon') {
              setting.fullAccessVideoText.icon = url;
            } else {
              setting[key] = url;
            }
          }

          cb();
        });
      }

      async.eachSeries([
        'fullAccessVideoTextIcon',
        'imageHomeFullPath',
        'imageWelcomeFullPath',
        'imageLoginFullPath',
        'logoFullPath',
        'imageMemberNotVip',
        'favicon',
        'videoWatermarkPath'
      ], function(key, cb) {
        if (!req.files.file || !req.files.file[key]) {
          return cb();
        }

        Func(req.files.file[key], req.user._id, function(err, url) {
          if (!err) {
            if (key === 'fullAccessVideoTextIcon') {
              setting.fullAccessVideoText.icon = url;
            } else {
              setting[key] = url;
            }
          }

          cb();
        });
      }, function() {
        SettingBusiness.update(setting)
        .then(() => res.status(200).send(setting));
      });
    });
  }

  static contact(req, res) {
    Mailer.sendMail('contact.html', config.adminEmail, Object.assign({
      subject: 'New contact message'
    }, req.body), function(err) {
      res.status(200).send({
        message: 'OK'
      });
    });
  }
}

module.exports = SettingController;
