'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import moment from 'moment';
import async from 'async';
import PerformerModel from './performerModel';
import UserModel from './userModel';
import SettingModel from './settingModel';
import OrderModel from './orderModel';

var EarningSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserModel', index: true },
  performerId: { type: Schema.Types.ObjectId, ref: 'PerformerModel', index: true },
  type: {
    type: String,
    enum: ['tip', 'monthly_subscription', 'yearly_subscription', 'store', 'sale_video'],
    index: true
  },
  commission: { type: Number, default: 10 },
  priceOriginal: { type: Number, default: 0 },
  //for web owner
  priceReceive: { type: Number, default: 0 },
  //for performer
  pricePay: { type: Number, default: 0 },
  paid: { type: Boolean, default: false },
  user: { type: Schema.Types.Mixed },
  performer: { type: Schema.Types.Mixed },
  product: { type: Schema.Types.Mixed },
  videoId: { type: Schema.Types.ObjectId },
  order: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  autoIndex: true,
  collection: 'earning',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
EarningSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.priceReceive = this.priceOriginal * (this.commission / 100);
      this.pricePay = this.priceOriginal - this.priceReceive;
    } else {
      this.updatedAt = new Date();
    }

    let _this = this;
    async.auto({
      performer(cb) {
        PerformerModel.findOne({
          _id: _this.performerId
        }, cb);
      },
      user(cb) {
        UserModel.findOne({
          _id: _this.userId
        }, cb);
      }
    }, function(err, result) {
      if (!err) {
        if (result.performer) {
          _this.performer = result.performer.publicProfile();
        }
        if (result.user) {
          _this.user = result.user.publicProfile();
        }
      }

      next();
    });
  });

EarningSchema.statics.addNew = function(data, cb) {
  let This = this;
  async.auto({
    performer(cb) {
      PerformerModel.findOne({
        _id: data.performerId
      }, cb);
    },
    setting(cb) {
      SettingModel.findOne({}, function(err, setting) {
        if (err || !setting) {
          return cb('Setting error!');
        }

        cb(null, setting);
      });
    }
  }, function(err, result) {
    if (err || !result.performer) {
      return cb('Setting error!');
    }
    let tipComission = /*result.performer.tipCommision || */ result.setting.tipCommision;
    let subscriptionCommision = /*result.performer.subscriptionCommision || */ result.setting.subscriptionCommision;

    let commission = data.type === 'tip' ? tipComission : subscriptionCommision;
    let model = new This({
      type: data.type,
      commission,
      priceOriginal: data.price,
      performerId: data.performerId,
      userId: data.userId
    });
    model.save(cb);
  });
};

EarningSchema.statics.addTip = function(data, cb) {
  let This = this;
  SettingModel.findOne({}, function(err, setting) {
    if (err || !setting) {
      return cb('Setting error!');
    }

    let commission = setting.tipCommision;
    async.auto({
      performer(cb) {
        PerformerModel.findOne({
          _id: data.performerId
        }, cb);
      },
      earning: ['performer', function(result, cb) {
        let model = new This({
          type: 'tip',
          commission: result.performer.tipCommision || commission,
          priceOriginal: data.price,
          performerId: data.performerId,
          userId: data.userId
        });
        model.save(cb);
      }],
      user(cb) {
        UserModel.findOne({
          _id: data.userId
        }, cb);
      },
      order: ['performer', 'user', function(result, cb) {
        if (err || !result.performer || !result.user) {
          return cb(err);
        }

        let price = data.price;
        var order = new OrderModel({
          user: data.userId,
          description: 'Tip to ' + result.performer.name,
          type: 'tip_performer',
          quantity: 1,
          price: price,
          totalPrice: price,
          name: result.user.name,
          address: '',
          email: result.user.email,
          phone: '',
          paymentInformation: null,
          status: 'active'
        });
        order.save(cb);
      }]
    }, cb);
  });
};

EarningSchema.statics.addProduct = function(data, cb) {
  let This = this;
  SettingModel.findOne({}, function(err, setting) {
    let commission = setting.storeComission;

    let model = new This({
      type: 'store',
      commission: /*data.performer.storeComission || */commission,
      priceOriginal: data.order.totalPrice,
      performerId: data.performer._id,
      userId: data.user._id,
      order: data.order,
      product: data.product
    });
    model.save(cb);
  });
}

EarningSchema.statics.addSaleVideo = function(data, cb) {
  let This = this;
  SettingModel.findOne({}, function(err, setting) {
    let commission = setting.storeComission;
    let model = new This({
      type: 'sale_video',
      commission: commission,
      priceOriginal: data.order.totalPrice,
      performerId: data.performerId,
      userId: data.userId,
      order: data.order,
      videoId: data.order.videoId
    });
    model.save(cb);
  });

}

module.exports = mongoose.model('EarningModel', EarningSchema);
