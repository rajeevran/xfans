/**
 * User model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var UserEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
UserEvents.setMaxListeners(0);

UserEvents.on(keys.USER_CREATED, (user) => {
  //set confirm email to the queue
  Queue.create(keys.SEND_MAIL, {
    title: 'Please confirm email',
    to: user.email,
    template: 'confirmEmail',
    data: { user }
  });
});

UserEvents.on(keys.USER_FOTGOT, (user) => {
  //set confirm email to the queue
  Queue.create(keys.SEND_MAIL, {
    title: 'New password',
    to: user.email,
    template: 'New passwod is: ',
    data: { user }
  });
});

module.exports = UserEvents;
