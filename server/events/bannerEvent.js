/**
 * Banner model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var BannerEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BannerEvents.setMaxListeners(0);

BannerEvents.on(keys.PHOTO_CREATED, (banner) => {

});

module.exports = BannerEvents;
