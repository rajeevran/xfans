'use strict';

import { AffiliateAccount } from '../../models';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import config from '../../config/environment';
import async from 'async';

exports.create = function(req, res) {
  const account = new AffiliateAccount(req.body);
  account.save(function(err) {
    if (err) {
      return res.status(400).send(err);
    }

    res.status(200).send(account);
  });
};

exports.update = function(req, res) {
  AffiliateAccount.findOne({
    _id: req.params.id
  }, function(err, account) {
    if (err) {
      return res.status(400).send(err);
    }

    _.merge(account, req.body);
    account.save(function() {
      res.status(200).send(account);
    });
  });
};

exports.delete = function(req, res) {
  AffiliateAccount.remove({
    _id: req.params.id
  }, function() {
    res.status(200).send({
      message: 'Deleted'
    });
  });
};

exports.show = function(req, res) {
  AffiliateAccount.findOne({
    _id: req.params.id
  }, function(err, account) {
    res.status(200).send(account);
  });
};

exports.login = function(req, res) {
  AffiliateAccount.findOne({
    username: req.body.username
  }, function(err, account) {
    if (!err && account) {
      account.authenticate(req.body.password, function(authError, authenticated) {
        if (authError) {
          return res.status(400).send({ message: 'This password is not correct.' });
        }

        // get token
        const token = jwt.sign({ _id: account._id }, config.secrets.session, {
          expiresIn: 60 * 60 * 24 * 30
        });

        res.status(200).send({
          affiliateToken: token
        });
      });
    }else {
      res.status(404).send({message: 'Account is not exist.'});
    }
  });
};

exports.me = function(req, res) {
  res.status(200).send(req.affiliate);
};

exports.search = function(req, res) {
  const page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take) || 10;
  const query = {};
  const sort = { createdAt: -1 };

  async.auto({
    items(cb) {
      AffiliateAccount.find(query)
        .sort(sort)
        .skip(page * take)
        .limit(take)
        .exec(cb);
    },
    count(cb) {
      AffiliateAccount.count(query, cb);
    }
  }, function(err, result) {
    if (err) {
      return res.status(400).send(err);
    }

    res.status(200).send(result);
  });
};
