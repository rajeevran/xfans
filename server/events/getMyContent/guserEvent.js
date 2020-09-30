/**
 * User model events
 */

'use strict';

import { EventEmitter } from 'events';
import keys from '../../config/keys';

var GUserEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
GUserEvents.setMaxListeners(0);

GUserEvents.on(keys.USER_CREATED, (user) => {
  //set confirm email to the queue

});

GUserEvents.on(keys.USER_FOTGOT, (user) => {
  //set confirm email to the queue

});

module.exports = GUserEvents;
