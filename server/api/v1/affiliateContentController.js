'use strict';

import { AffiliateContent, PerformerModel } from '../../models';
import config from '../../config/environment';
import { S3, GM, Uploader, Queue, AWSS3 } from '../../components';
import { StringHelper } from '../../helpers';
import async from 'async';
import _ from 'lodash';

exports.upload = function(req, res) {
  const affiliateContent = new AffiliateContent(req.body);
  affiliateContent.fileType = config.fileType;
  if (!req.files.file) {
    return res.status(400).send({
      message: 'Missing file'
    });
  }

  Uploader.uploadFile(req.files.file, function(err, filePath) {
    if (err) {
      return res.status(400).send({
        message: 'Upload file error'
      });
    }

    affiliateContent.filePath = filePath;
    affiliateContent.performer = req.user.role === 'admin' && req.body.performer ? req.body.performer : req.user._id;
    affiliateContent.fileType = config.fileType;
    affiliateContent.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: 'Upload file error'
        });
      }
      res.status(200).send(affiliateContent);
    });
  });
};

exports.show = function(req, res) {
  async.auto({
    content(cb) {
      AffiliateContent.findOne({
        _id: req.params.id
      }, cb);
    },
    performer: ['content', function(result, cb) {
      PerformerModel.findOne({
        _id: result.content.performer
      }, cb);
    }]
  }, function(err, result) {
    if (err) {
      return res.status(400).send(err);
    }

    const content = result.content.toObject();
    content.filePath = AWSS3.getSignedUrl(content.filePath, {
      forceDownload: true
    });
    if(result.performer) {
      content.performerInfo = result.performer.publicProfile();
    }

    res.status(200).send(content);
  });
};

exports.search = function(req, res) {
  const page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take) || 10;
  const query = {};
  const sort = { createdAt: -1 };
  if (req.query.performerId || req.query.performer) {
    query.performer = req.query.performerId || req.query.performer;
  }

  async.auto({
    contents(cb) {
      AffiliateContent.find(query)
        .sort(sort)
        .skip(page * take)
        .limit(take)
        .exec(cb);
    },
    count(cb) {
      AffiliateContent.count(query, cb);
    },
    performers: ['contents', function(result, cb) {
      const ids = _.map(result.contents, c => c.performer);
      if (!ids) {
        return cb(null, []);
      }

      PerformerModel.find({
        _id: {
          $in: ids
        }
      }, cb);
    }]
  }, function(err, result) {
    if (err) {
      return res.status(400).send(err);
    }
    const results = [];
    result.contents.forEach(function(content) {
      const data = content.toObject();
      const performer = _.find(result.performers, p => p._id.toString() === content.performer.toString());
      data.performerInfo = performer ? performer.publicProfile() : {};
      data.filePath = AWSS3.getSignedUrl(data.filePath, {
        forceDownload: true
      });
      data.previewFilePath = AWSS3.getSignedUrl(content.filePath);
      results.push(data);
    });

    res.status(200).send({
      items: results,
      count: result.count
    });
  });
};

exports.delete = function(req, res) {
  AffiliateContent.findOne({
    _id: req.params.id
  }, function(err, content) {
    if (err) {
      return res.status(400).send(err);
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== content.performer.toString()) {
      res.status(403).send();
    }

    content.remove(function(err) {
      if (err) {
        return res.status(400).send(err);
      }

      res.status(200).send({
        message: 'Deleted content'
      });
    });
  });
};

exports.update = function(req, res) {
  async.auto({
    content(cb) {
      AffiliateContent.findOne({
        _id: req.params.id
      }, cb);
    },
    filePath(cb) {
      if (!req.files || !req.files.file) {
        return cb();
      }

      Uploader.uploadFile(req.files.file, cb);
    }
  }, function(err, result) {
    if (err) {
      return res.status(400).send(err);
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== result.content.performer.toString()) {
      return res.status(403).send();
    }

    _.merge(result.content, req.body);
    if (result.filePath) {
      result.content.filePath = result.filePath;
      result.content.convertStatus = 'pending';
    }

    result.content.save(() => res.status(200).send(result.content));
  });
};

exports.performers = function(req, res) {
  let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
  let take = parseInt(req.query.take) || 12;

  AffiliateContent.aggregate([
  	{
  	  $group: {
  	    _id: "$performer"
  	  }
  	}
  ], function(err, records) {
    if (err || !records || !records.length) {
      return res.status(200).send([]);
    }

    let performerIds = records.map(record => record._id);
    let query = {
      _id: {
        $in: performerIds
      }
    };
    let sort = { name: 1 };
    if (req.query.sort) {
      sort = {};
      sort[req.query.sort] = req.query.sortType || 1;
    }
    async.parallel({
      items(cb) {
        PerformerModel.find(query)
          .sort(sort)
          .skip(page * take)
          .limit(take)
          .exec(cb);
      },
      count(cb) {
        PerformerModel.count(query, cb);
      }
    }, function(err, result) {
      if (err) {
        return res.status(500).send(err);
      }

      res.status(200).send({
        count: result.count,
        items: result.items.map(p => p.publicProfile())
      });
    });
  });
};
