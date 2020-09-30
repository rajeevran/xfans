const request = require('request');
const IPBlocked = require('../models/ipBlocked');
const CountryBlock = require('../models/country-block');
const moment = require('moment');

exports.checkBlocked = function (ip, cb) {
  IPBlocked.findOne({
    ip
  }, function(err, item) {
    if (item) {
      return cb(null, true);
    }

      request({
        method: 'GET',
        uri: `http://ip-api.com/json/${ip}`
      }, function (err, response, body) {
        if (err) {
          return cb(null, true);
        }
        let data;
        if (typeof body == 'string') {
           data = JSON.parse(body);
          if (data.status === 'fail') {
          return cb(null, false);
          }
        } else {
          data = body;
          if (data.status === 'fail') {
          return cb(null, false);
          }
        }

        IPBlocked.findOne({
          ip,
          createdAt: {
            $gt: moment().add(1, 'hours').toDate()
          }
        }, function(err, item) {
          if (err) {
            return cb(null, false)
          }
          if (item) {
            return cb(null, true);
          }

          CountryBlock.findOne({
            code: data.countryCode
          }, function(err, countryBlock) {
            if (err) {
              return cb(null, false);
            }
            if (!countryBlock) {
              return cb(null, false);
            }

            const blocked = data && data.countryCode && countryBlock.code === data.countryCode;
            if (blocked) {
              IPBlocked.create({
                ip
              });
            }

            return cb(null, countryBlock.code === data.countryCode);
          });
        });
      });
    });
};
