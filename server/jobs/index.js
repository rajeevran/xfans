"use strict";
import async from "async";

var Schedule = require("./Schedule");
var ExpiredSubscription = require("./expired-subscription");
var ExpireNotificaion = require("./subscription-expire-notification");
var DeleteTmpFile = require("./delete-tmp-file");
var RemoveGeoBlock = require("./remove-geo-block");

// Schedule();

// setInterval(function() {
//   Schedule();
//   //console.log('schedule job');
// }, 1 * 60 * 60 * 1000);

// async.forever(function(next) {
//   ExpiredSubscription(function() {
//     //every 12h
//     setTimeout(next, 12 * 60 * 60 * 1000);
//   });
// }, function(err) {
//   console.log(err);
// });

// async.forever(function(next) {
//   ExpireNotificaion(function() {
//     //every 12h
//     setTimeout(next, 24 * 60 * 60 * 1000);
//   });
// }, function(err) {
//   console.log(err);
// });

DeleteTmpFile(function() {
  console.log("running for schedule", new Date());
  Schedule(function() {
    console.log("scheduled done", new Date());

    process.exit();
  });
});

async.forever(
  function(next) {
    RemoveGeoBlock(function() {
      //every 12h
      setTimeout(next, 1 * 60 * 60 * 1000);
    });
  },
  function(err) {
    console.log(err);
  }
);
