'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';

var ProfileView = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserModel' },
  performerId: { type: Schema.Types.ObjectId, ref: 'PerformerModel' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'profileViews',
  restrict: true,
  minimize: false
});

module.exports = mongoose.model('ProfileView', ProfileView);
