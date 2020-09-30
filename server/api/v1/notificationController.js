'use strict';

import { NotificationModel } from '../../models';
import { NotificationBusiness } from '../../businesses';
import { NotificationValidator, parseJoiError } from '../../validators';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

class NotificationController {
  /**
   * Get list of Notifications
   */
  static index(req, res) { 
    if(req.query.limit!='undefined'){
			req.query.limit = parseInt(req.query.limit);
		}
		if(req.query.offset!='undefined'){
			req.query.offset = parseInt(req.query.offset);
		}
    return NotificationBusiness.find()
      .then(notifications => {
        res.status(200).json(notifications);
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Notification
   */
  static create(req, res, next) {
    NotificationValidator.validateCreating(req.body).then(data => {

      NotificationBusiness.create(data,req.user).then(function(notification) {

        res.status(200).json(notification);
      })
      .catch(err => {
        validationError(res, 422)(err);
      });
    })
    .catch(err => {
      validationError(res, 422)(parseJoiError(err));
    });
  }

  /**
   * Get a single Notification
   */
  static show(req, res, next) {
    NotificationBusiness.findOne({_id: req.params.id})
    .then(notification => {
      if (!notification) {
        return res.status(404).end();
      }
      res.json(notification);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single Notification
   */
  static update(req, res, next) {
    NotificationValidator.validateUpdating(req.body).then(data => {
      NotificationBusiness.findOne({_id: req.params.id}).then(notification => {

        if(!notification) {
          return validationError(res, 404)({message: 'Not found'});
        }
        if(data._id) {
          delete data._id;
        }
        notification = _.merge(notification, data);
        NotificationBusiness.update(notification).then(function(notification) {
            return res.status(200).json(notification);
          })
          .catch(err => {
            validationError(res, 500)(err);
          });
        })
        .catch(err => {
         validationError(res, 422)(parseJoiError(err));
        });
      });
      
  }

  /**
   * Deletes a Notification
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    NotificationBusiness.findOne(condition).then(
      notification => {
        if(!notification) {
          return res.status(404,'Not found').end();
        }
        NotificationBusiness.removeById(notification._id)
        .then(function() {
          res.status(200,true).end();
        });
      },
      err => handleError(res)
    ); 
  }


  /**
   * Authentication callback
   */
  static authCallback(req, res, next) {
    res.redirect('/');
  }
}

module.exports = NotificationController;
