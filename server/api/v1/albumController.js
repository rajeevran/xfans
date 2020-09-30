'use strict';

import { PerformerAlbumModel, PhotoModel } from '../../models';
import _ from 'lodash';
import async from 'async';

exports.list = function(req, res) {
  let query = {};
  if (req.query.performerId) {
    var ids = req.query.performerId.split(',');
    query.performerIds = {
      $in: ids
    };
  }

  async.parallel({
    count(cb) {
      PerformerAlbumModel.count(query, cb);
    },
    items(cb) {
      PerformerAlbumModel.find(query)
        .sort({ name: 1 })
        .exec(cb);
    }
  }, (err, result) => {
    if (err) { return res.status(500).send(err); }

    res.status(200).json(result);
  });
};

exports.create = function(req, res) {
  let item = new PerformerAlbumModel(req.body);
  item.save((err, data) => res.status(err ? 500 : 200).send(data));
};

exports.update = function(req, res) {
  delete req.body._id;
  req.album = _.merge(req.album, req.body);
  req.album.save((err, data) => res.status(err ? 500 : 200).send(data));
};

exports.delete = function(req, res) {
  req.album.remove(err => res.status(err ? 500 : 200).send({ success: err ? false : true }));
};

exports.findOne = function(req, res) {
  res.status(200).send(req.album);
};

exports.findAllPerfomerAlbums = function(req, res) {
  if (!req.query.performerId) {
    return res.status(200).send();
  }
  async.parallel({
    albums(cb) {
      let query = req.performer ? {
        performerIds: {
          $in: [req.performer._id]
        }
      } : {};
      PerformerAlbumModel.find(query, function(err, albums) {
        if (err) {
          cb(err);
        }

        let results = [];
        async.eachSeries(albums, function(album, cb) {
          PhotoModel.find({
            performerAlbumIds: {
              $in: [album._id]
            },
            isActive: {
              $ne: false
            }
          })
          .limit(4) //get 4 images
          .sort({ createdAt: -1 })
          .exec(function(err, photos) {
            let item = album.toJSON();
            if (!err) {
              item.photos = photos;
            }

            //do not push empty album!
            if (photos.length) {
              results.push(item);
            }
            cb();
          });
        }, function(err) {
          if (err) {
            return cb(err);
          }

          cb(null, results);
        });
      });
    },
    others(cb) {
      let query = req.performer ? {
        performer: {
          $in: [req.performer._id]
        },
        performerHaveAbumIds: {
          $nin: [req.performer._id]
        }
      } : {};

      PhotoModel.find(query)
      .limit(4) //get 4 images
      .sort({ createdAt: -1 })
      .exec(cb);
    }
  }, function(err, result) {
    if (err) {
      return res.status(500).send(err);
    }

    if (result.others.length) {
      result.albums.push({
        _id: 'others',
        name: 'Others',
        photos: result.others
      });
    }

    res.status(200).send(result.albums);
  });

};

exports.countAllAlbums = function(req, res) {
  let query = {
    isActive: {
      $ne: false
    }
  };
  PerformerAlbumModel.count(query, function(err, count) {
    res.status(200).send({ count: count || 0 });
  });
};

exports.middlewares = {
  findOne(req, res, next) {
    PerformerAlbumModel.findOne({ _id: req.params.id }, function(err, data) {
      if (err || !data) {
        return res.status(404).send(err);
      }

      req.album = data;
      next();
    });
  }
};
