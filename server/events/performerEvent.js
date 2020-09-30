/**
 * Performer model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var PerformerEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PerformerEvents.setMaxListeners(0);

PerformerEvents.on(keys.PERFORMER_CREATED, (performer) => {

});

module.exports = PerformerEvents;
