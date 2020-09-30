'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';

var MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'UserModel' },
  recipientIds: { type: Schema.Types.ObjectId, ref: 'UserModel' },
  messageGroupId: { type: Schema.Types.ObjectId, ref: 'MessageGroupModel' },
  type: {
    type: String,
    default: 'text',
    enum: ['text', 'image']
  },
  content: { type: String, required: true },
  meta: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'messages',
  restrict: true,
  minimize: false
});

/**
 * Pre-save hook
 */
MessageSchema
  .pre('save', function(next) {
    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }

    next();
  });

MessageSchema
  .post('save', function(data, next) {
    var MessageGroup = require('./MessageGroup');
    var lastContent = data.type === 'image' ? 'Shared an image' : data.content;
    MessageGroup.update({ _id: data.messageGroupId }, {
        $set: {
          lastSenderId: data.senderId,
          lastContent: lastContent,
          lastMessageId: data._id,
          lastMessageCreatedAt: data.createdAt,
          updatedAt: new Date()
        }
      }, (err) => {
        if (err) {
          console.log('Post save message error', err);
        }

        next();
      });
  });

module.exports = mongoose.model('MessageModel', MessageSchema);
