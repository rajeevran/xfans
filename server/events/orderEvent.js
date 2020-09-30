/**
 * Order model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var OrderEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OrderEvents.setMaxListeners(0);

OrderEvents.on(keys.ORDER_CREATED, (order) => {

});

module.exports = OrderEvents;
