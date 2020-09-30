var config = require('../config/environment');
var util = require('util');
var oauth = require('oauth');
var Twitter = require('twitter');
// Get your credentials here: https://dev.twitter.com/apps
var _twitterConsumerKey = config.twitter.clientID;
var _twitterConsumerSecret = config.twitter.clientSecret;
var PerformerModel = require('../models/performerModel');
var VideoModel = require('../models/videoModel');
var request = require('request').defaults({ encoding: null });
const fs = require('fs');
import { StringHelper } from '../helpers';

module.exports = function(queue) {
  queue.process('AUTO_POST_TWITTER', function(job, done) {
    let data = job.data;
    let query = {
      _id: data.performerId,
      autoPostTwitter: true,
      connectTwitter: true
    };
    if (data.type === 'manual') {
      delete query.autoPostTwitter;
    }
    PerformerModel.findOne({
      _id: data.performerId,
      autoPostTwitter: true,
      connectTwitter: true
    }, function(err, performer) {
      if (err || !performer) {
        return done();
      }

      VideoModel.findOne({
        _id: data.videoId,
        clipUrl: {
          $ne: null
        }
      }, function(err, video) {
        if (err || !video) {
          return done();
        }

        let attempts = 1;
        function tryToUpload() {
          const url = StringHelper.isUrl(video.clipUrl) ? video.clipUrl : config.baseUrl + video.clipUrl;
          request.get(url, function (err, response, body) {
            if (err || response.statusCode !== 200) {
              //should try just 3 times
              if (attempts > 2) {
                return done();
              }

              attempts++;
              return setTimeout(tryToUpload, 10000);
            }

            var client = new Twitter({
              consumer_key: _twitterConsumerKey,
              consumer_secret: _twitterConsumerSecret,
              access_token_key: performer.twitterAccessToken,
              access_token_secret: performer.twitterAccessSecret
            });

            var mediaType   = 'video/mp4'; //
            var mediaData   = body;
            var mediaSize    = response.headers['content-length'];
            initUpload() // Declare that you wish to upload some media
              .then(appendUpload) // Send the data for the media
              .then(finalizeUpload) // Declare that you are done uploading chunks
              .then(mediaId => {
                // You now have an uploaded movie/animated gif
                // that you can reference in Tweets, e.g. `update/statuses`
                // will take a `mediaIds` param.
                let status;
                if (video.customTwitterTextVideo) {
                  status = `${config.baseUrl}movies/${video.alias}/${video._id} check out my latest post ${video.customTwitterTextVideo}`;
                } else {
                  status = `${config.baseUrl}movies/${video.alias}/${video._id} check out my latest post ${performer.customTwitterTextVideo}`;
                }
                //limit of Twitter is 280 characters, so if it is too long, splitit
                client.post('statuses/update', {
                  status: status.trim().substr(0, 280),
                  media_ids: mediaId
                },  function(err) {
                  done();
                });
              })
              .catch(e => done());

              /**
               * Step 1 of 3: Initialize a media upload
               * @return Promise resolving to String mediaId
               */
              function initUpload () {
                return makePost('media/upload', {
                  command    : 'INIT',
                  total_bytes: mediaSize,
                  media_type : mediaType,
                }).then(data => data.media_id_string);
              }

              /**
               * Step 2 of 3: Append file chunk
               * @param String mediaId    Reference to media object being uploaded
               * @return Promise resolving to String mediaId (for chaining)
               */
              function appendUpload (mediaId) {
                return makePost('media/upload', {
                  command      : 'APPEND',
                  media_id     : mediaId,
                  media        : mediaData,
                  segment_index: 0
                }).then(data => mediaId);
              }

              /**
               * Step 3 of 3: Finalize upload
               * @param String mediaId   Reference to media
               * @return Promise resolving to mediaId (for chaining)
               */
              function finalizeUpload (mediaId) {
                return makePost('media/upload', {
                  command : 'FINALIZE',
                  media_id: mediaId
                }).then(data => mediaId);
              }

              /**
               * (Utility function) Send a POST request to the Twitter API
               * @param String endpoint  e.g. 'statuses/upload'
               * @param Object params    Params object to send
               * @return Promise         Rejects if response is error
               */
              function makePost (endpoint, params) {
                return new Promise((resolve, reject) => {
                  client.post(endpoint, params, (error, data, response) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve(data);
                    }
                  });
                });
              }
          });
        }

        tryToUpload();
      });
    });
  });
};
