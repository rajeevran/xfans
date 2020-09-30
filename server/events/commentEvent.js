/**
 * Comment model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var CommentEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CommentEvents.setMaxListeners(0);

CommentEvents.on(keys.COMMENT_CREATED, (comment) => {

});

module.exports = CommentEvents;
