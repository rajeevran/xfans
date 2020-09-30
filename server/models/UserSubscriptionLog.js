'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';

var SubscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserModel' },
  performerId: { type: Schema.Types.ObjectId, ref: 'PerformerModel' },
  registerDate: { type: Date },
  expiredDate: { type: Date },
  price: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'usersubscriptionlogs',
  restrict: true,
  minimize: false
});

module.exports = mongoose.model('UserSubscriptionLogModel', SubscriptionSchema);
