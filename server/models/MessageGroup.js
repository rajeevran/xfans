'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';

var GroupSchema = new Schema({
  userIds: [{ type: Schema.Types.ObjectId, ref: 'UserModel' }],
  readLastMessageUserIds: [{ type: Schema.Types.ObjectId, ref: 'UserModel' }],
  lastSenderId: { type: Schema.Types.ObjectId, ref: 'UserModel' },
  lastContent: { type: String },
  lastMessageId: { type: Schema.Types.ObjectId, ref: 'MessageModel'},
  lastMessageCreatedAt: { type: Date },
  type: { type: String, enum: ['private', 'group', 'model', 'subscriber'], default: 'subscriber' },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'messagegroups',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
GroupSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }

    next();
  });


module.exports = mongoose.model('MessageGroupModel', GroupSchema);
