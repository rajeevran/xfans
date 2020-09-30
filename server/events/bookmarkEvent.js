/**
 * Bookmark model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var BookmarkEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BookmarkEvents.setMaxListeners(0);

BookmarkEvents.on(keys.BOOKMARK_CREATED, (bookmark) => {

});

module.exports = BookmarkEvents;
