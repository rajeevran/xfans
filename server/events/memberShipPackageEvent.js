/**
 * MemberShipPackage model events
 */

'use strict';

import { EventEmitter } from 'events';
import { Queue } from '../components';
import keys from '../config/keys';

var MemberShipPackageEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
MemberShipPackageEvents.setMaxListeners(0);

MemberShipPackageEvents.on(keys.MEMBERSHIP_CREATED, (memberShipPackage) => {

});

module.exports = MemberShipPackageEvents;
