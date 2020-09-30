'use strict';

import { UserTempModel } from '../../models';
import { UserTempBusiness } from '../../businesses';
import { UserBusiness } from '../../businesses';
import { UserTempValidator, parseJoiError } from '../../validators';
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

class UserTempController {
  /**
   * Get list of UserTemps
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
			req.query.limit = parseInt(req.query.limit);
		}
		if(req.query.offset!='undefined'){
			req.query.offset = parseInt(req.query.offset);
		}
    return UserTempBusiness.find(req.user)
      .then(userTemps => {
        res.status(200).json(userTemps);
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new UserTemp
   */
  static create(req, res, next) {
    UserTempValidator.validateCreating(req.body).then(data => {

      UserBusiness.findOne({email: req.body.email})
        .then(userTemp => {
          if (userTemp) {
            return validationError(res, 422)({errors:{email:{message:'The specified email address is already in use.'}}});
          }
          UserTempBusiness.create(data,req.user).then(function(userTemp) {
           res.status(200).json(userTemp);
          })
          .catch(err => {
            validationError(res, 422)(err);
          });
        })
        .catch(err => next(err));
    })
    .catch(err => {
      validationError(res, 422)(parseJoiError(err));
    });
  }

  /**
   * Get a single UserTemp
   */
  static show(req, res, next) {
    UserTempBusiness.findOne({_id: req.params.id})
    .then(userTemp => {
      if (!userTemp) {
        return res.status(404).end();
      }
      res.json(userTemp);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single UserTemp
   */
  static update(req, res, next) {
    UserTempValidator.validateUpdating(req.body).then(data => {
      UserTempBusiness.findOne({_id: req.params.id}).then(userTemp => {

        if(!userTemp) {
          return validationError(res, 404)({message: 'Not found'});
        }
        if(data._id) {
          delete data._id;
        }
        userTemp = _.merge(userTemp, data);
        UserTempBusiness.update(userTemp).then(function(userTemp) {
            return res.status(200).json(userTemp);
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
   * Deletes a UserTemp
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id,
      user: req.user._id
    }
    UserTempBusiness.findOne(condition).then(
      userTemp => {
        if(!userTemp) {
          return res.status(404,'Not found').end();
        }
        UserTempBusiness.removeById(userTemp._id)
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

module.exports = UserTempController;
