import { Queue } from '../components';
import { AffiliateContent } from '../models';
import async from 'async';

module.exports = function(cb) {
  AffiliateContent.find({
    addedWatermark: {
      $ne: true
    }
  }, function(err, contents) {
    if (err) {
      return cb(err);
    }

    async.eachSeries(contents, function(content, cb) {
      Queue.create('UDATE_WATERMARK_AFFILIATE_CONTENT', content.toObject())
      .save(() => cb());
    }, cb);
  });
};
