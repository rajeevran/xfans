/**
 * Product model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var ProductEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ProductEvents.setMaxListeners(0);

ProductEvents.on(keys.PRODUCT_CREATED, (product) => {

});

ProductEvents.on(keys.PRODUCT_UPDATED, (product) => {
 
});

module.exports = ProductEvents;
