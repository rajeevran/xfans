/**
 * UserTemp model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var UserTempEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
UserTempEvents.setMaxListeners(0);

UserTempEvents.on(keys.BOOKMARK_CREATED, (bookmark) => {

});

module.exports = UserTempEvents;
