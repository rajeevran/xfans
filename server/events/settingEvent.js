/**
 * Setting model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var SettingEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
SettingEvents.setMaxListeners(0);

SettingEvents.on(keys.SETTING_CREATED, (setting) => {

});

module.exports = SettingEvents;
