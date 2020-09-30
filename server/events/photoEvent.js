/**
 * Photo model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var PhotoEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PhotoEvents.setMaxListeners(0);

PhotoEvents.on(keys.PHOTO_CREATED, (photo) => {

});

module.exports = PhotoEvents;
