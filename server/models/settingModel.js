'use strict';

import mongoose, { Schema } from 'mongoose';

var SettingSchema = new Schema({
  metaTitle: String,
  metaDescription: String,
  metaKeyword: String,
  companyName: String,
  address: String,
  email: String,
  logoFullPath: String,
  videoWatermarkPath: String,
  imageHomeFullPath: String,
  imageWelcomeFullPath: String,
  imageMemberNotVip: String,
  imageLoginFullPath: String,
  hotline: String,
  footerContent: String,
  welcomeTitle: String,
  welcomeContent: String,
  landingPageContent: String,
  clientAccnumSubscriptions: String,
  clientSubaccSubscriptions: String,
  formNameSubscriptions: String,
  currencyCodeSubscriptions: String,
  saltSubscriptions: String,
  clientAccnumSingle: String,
  clientSubaccSingle: String,
  formNameSingle: String,
  currencyCodeSingle: String,
  saltSingle: String,
  ccbillEnable: {
    type: Boolean,
    default: true
  },
  paypal: {
    username: String,
    password: String,
    signature: String,
    sandbox: Boolean,
    enable: {
      type: Boolean,
      default: true
    }
  },
  bitpay: {
    enable: {
      type: Boolean,
      default: true
    },
    apiKey: String,
    sandbox: Boolean
  },
  mailchimp: {
    apiKey: String,
    listId: String,
    active: {
      type: Boolean,
      default: true
    }
  },
  fullAccessVideoText: {
    text1: {
      type: String,
      default: 'You Must be a member to watch this video'
    },
    text2: {
      type: String,
      default: 'Get full access here'
    },
    icon: {
      type: String,
      default: '/assets/images/arrow.png'
    }
  },
  color: {
    enable: {
      type: Boolean,
      default: false
    },
    main: String,
    lines: String,
    button: String,
    buttonHover: String,
    buttonBorder: String,
    link: String,
    linkHover: String,
    custom: String
  },
  siteName: {
    type: String,
    default: ''
  },
  favicon: String,
  //tipCommision in percentage
  tipCommision: {
    type: Number,
    default: 10
  },
  subscriptionCommision: {
    type: Number,
    default: 10
  },
  storeComission: {
    type: Number,
    default: 10
  },
  createdAt: {
  	type: Date, default: Date.now
  },
  updatedAt: {
  	type: Date, default: Date.now
  }
}, {
  collection: 'settings',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
SettingSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    next();
  });

module.exports = mongoose.model('SettingModel', SettingSchema);
