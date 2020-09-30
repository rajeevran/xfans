'use strict';

import { PayoutModel } from '../../models';
import { PayoutBusiness, PerformerBusiness } from '../../businesses';
import { PayoutValidator, parseJoiError } from '../../validators';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import async from 'async';
import path from 'path';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}
/**
 * search requests payout
 **/
 exports.search = function (req, res){
   let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
   let take = parseInt(req.query.take) || 10;
   let query = {};
   let order = '-';
   let sort = 'createdAt';
   if (req.query.performerId) {
     query.performer = {
       $in: [req.query.performerId]
     };
   }
   if (req.query.keyword) {
     let regex = new RegExp(req.query.keyword, 'i');
     query.$and = [
       {
         title: regex
       }
     ];
   }
   if(req.query.sort && req.query.order){
     order = req.query.order;
     sort = req.query.sort;
   }

   async.parallel({
     count(cb) {
       PayoutModel.count(query, cb);
     },
     items(cb) {
       PayoutModel.find(query)
         .sort(order + sort)
         .skip(page * take)
         .limit(take)
         .exec(function(err,payouts){
           if(err){
             cb(err);
           }else {
             if(req.user.role === 'admin'){
               async.each(payouts, function(payout, callback){
                 if(payout.performer){
                   PerformerBusiness.findOne({_id: payout.performer}).then(function(performer){
                     if(performer){
                       payout.performer = performer;
                     }
                     callback();
                   })
                 }else {
                   callback();
                 }
             }, function(err){
               cb(err, payouts);
             });
           }else {
             cb(null, payouts);
           }
           }
         });
     }
   }, (err, result) => {
     if (err) { return res.status(500).send(err); }

     res.status(200).json(result);
   });
 };
/**
 * get list requests payout
 **/
exports.list = function (req, res) {
  PayoutValidator.validateFind(req.query)
      .then(data => {
        PayoutBusiness.find(data, function (err, results) {
          if (err) {
            return res.send(400, err).end();
          }
          return res.send(results).end();
        });
      })
      .catch(err => {
        validationError(res, 422)(parseJoiError(err));
      });
};
/**
 * Creates a new request payout
 */
exports.create = function (req, res) {
  PayoutValidator.validateCreating(req.body)
      .then(data => {
          PayoutBusiness.create(data)
              .then(function (payout) {
                return  res.status(200).json(payout);
              })
              .catch(err => {
                validationError(res, 422)(parseJoiError(err));
              });
        })
      .catch(err => {
        validationError(res, 422)(parseJoiError(err));
      });
};

/**
 * Get a single Page
 */
exports.show = function (req, res, next) {
  PayoutBusiness.findOne({_id: req.params.id})
      .then(payout => {
        if (!payout) {
          return res.status(404).end();
        }
        res.json(payout);
      })
      .catch(err => next(err));
};

/**
 * Update a single Page
 */
exports.update = function (req, res) {
  PayoutValidator.validateUpdating(req.body).then(data => {
    PayoutBusiness.findOne({_id: req.params.id}).then(payout => {
      payout.title = req.body.title;
      payout.description = req.body.description;
      payout.performer = req.body.performer;
      payout.startDate = req.body.startDate;
      payout.endDate = req.body.endDate;
      payout.status = req.body.status;

      return PayoutBusiness.update(payout)
          .then((payout) => {
            return  res.status(200).json(payout);
          })
          .catch(err => {
            validationError(res, 422)(parseJoiError(err));
          });

    }).catch(err => {
      validationError(res, 422)(parseJoiError(err));
    });
  }).catch(err => {
    validationError(res, 422)(parseJoiError(err));
  });
};

/**
 * Delete a Request
 */
exports.destroy = function (req, res) {
  var condition = {
    _id: req.params.id
  };
  if(req.user.role !== 'admin') {
    condition.performer = req.user._id;
  }
  PayoutBusiness.findOne(condition).then(
      payout => {
        if (!payout) {
          return res.status(404, 'Not found').end();
        }
        PayoutBusiness.removeById(payout._id)
            .then(function () {
              res.status(200, true).end();
            });
      },
      err => handleError(res)
  );
};
