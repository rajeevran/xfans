/**
 * saveVideo model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var SaveVideoEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
SaveVideoEvents.setMaxListeners(0);

SaveVideoEvents.on(keys.SAVVEVIDEO_CREATED, (video) => {

});

module.exports = SaveVideoEvents;
