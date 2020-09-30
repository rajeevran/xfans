import request from 'request';
import Setting from './settingModel';

function mailchimpAddListCall(options, cb) {
  if (!cb) {
    cb = function() {};
  }
  if (!options.email) {
    return cb('Email is required.');
  }

  Setting.findOne({}, function(err, setting) {
    if (!setting.mailchimp || !setting.mailchimp.active || !setting.mailchimp.apiKey || !setting.mailchimp.listId) {
      return cb('Mailchimp is not active');
    }

    var subscriber = JSON.stringify({
      email_address: options.email,
      status: 'subscribed',
      merge_fields: {
          FNAME: options.firstName,
          LNAME: options.lastName
      }
    });
    var listId = setting.mailchimp.listId;
    var apiKey = setting.mailchimp.apiKey;
    //expose server from api key
    var strArray = apiKey.split('-');
    if (strArray.length !== 2) {
      return cb('Wrong api key');
    }
    var subdomain = strArray[1];

    request({
      method: 'POST',
      url: `https://${subdomain}.api.mailchimp.com/3.0/lists/${listId}/members`,
      body: subscriber,
      headers: {
        Authorization: `apikey ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    function(err, response, body) {
      return cb(err, JSON.parse(body));
    });
  });
}

module.exports = {
  add: mailchimpAddListCall
};
