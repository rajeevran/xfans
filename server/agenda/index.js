var config = require('../config/environment');
var Agenda = require('agenda');
var agenda = new Agenda({
  db: {
    address: config.mongo.uri
  }
});

agenda.define('schedule-video', require('./schedule-video'));
agenda.define('expired-subscription', require('./expired-subscription'));
agenda.define('subscription-expire-notification', require('./subscription-expire-notification'));
agenda.define('delete-tmp-file', require('./delete-tmp-file'));
agenda.define('update-model-conversations', require('./update-model-conversations'));


// https://github.com/agenda/agenda/tree/v1.0.3
agenda.on('ready', function () {
  agenda.every('12 hours', 'delete-tmp-file');
  agenda.every('6 hours', 'subscription-expire-notification');
  agenda.every('6 hours', 'expired-subscription');
  agenda.every('12 hours', 'schedule-video');
  agenda.every('24 hours', 'update-model-conversations');

  agenda.start();
});
