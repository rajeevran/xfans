var config = require('../../config/environment');
var util = require('util');
var oauth = require('oauth');
var Twitter = require('twitter');
// Get your credentials here: https://dev.twitter.com/apps
var _twitterConsumerKey = config.twitter.clientID;
var _twitterConsumerSecret = config.twitter.clientSecret;
var PerformerModel = require('../../models/performerModel');

var consumer = new oauth.OAuth(
  "https://twitter.com/oauth/request_token",
  "https://twitter.com/oauth/access_token",
  _twitterConsumerKey,
  _twitterConsumerSecret,
  "1.0A",
  config.baseUrl + "api/v1/twitter/callback",
  "HMAC-SHA1"
);

exports.twitterConnect = function(req, res) {
  consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      return res.status(400).send(error);
    }

    req.session.oauthRequestToken = oauthToken;
    req.session.oauthRequestTokenSecret = oauthTokenSecret;
    req.session.performerId = req.user._id;

    res.redirect("https://twitter.com/oauth/authorize?oauth_token="+oauthToken);
  });
};

exports.twitterCallback = function(req, res) {
  consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error || !req.session.performerId) {
      //TODO - log here
      res.redirect('/home');
    }

    //store this key into performer profile for future use
    PerformerModel.update({
      _id: req.session.performerId
    }, {
      $set: {
        connectTwitter: true,
        twitterAccessToken: oauthAccessToken,
        twitterAccessSecret: oauthAccessTokenSecret
      }
    }, function() {
      //redirect to profile with twitter connect success alert?
      res.redirect('/manager/profile');
    });
  });
};
