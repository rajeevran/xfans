/**
 * Video model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var VideoEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
VideoEvents.setMaxListeners(0);

VideoEvents.on(keys.VIDEO_CREATED, (video) => {

});

module.exports = VideoEvents;
