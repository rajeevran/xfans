/**
 * Page model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var PageEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PageEvents.setMaxListeners(0);

PageEvents.on(keys.PAGE_CREATED, (page) => {

});

module.exports = PageEvents;
