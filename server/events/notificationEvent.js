/**
 * Notification model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var NotificationEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
NotificationEvents.setMaxListeners(0);

NotificationEvents.on(keys.NOTIFICATION_CREATED, (notification) => {

});

module.exports = NotificationEvents;
