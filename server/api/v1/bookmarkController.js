'use strict';

import { BookmarkModel } from '../../models';
import { BookmarkBusiness } from '../../businesses';
import { BookmarkValidator, parseJoiError } from '../../validators';
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

class BookmarkController {
  /**
   * Get list of Bookmarks
   */
  static index(req, res) { 
    if(req.query.limit!='undefined'){
			req.query.limit = parseInt(req.query.limit);
		}
		if(req.query.offset!='undefined'){
			req.query.offset = parseInt(req.query.offset);
		}
    return BookmarkBusiness.find(req.user)
      .then(bookmarks => {
        res.status(200).json(bookmarks);
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Bookmark
   */
  static create(req, res, next) {
    BookmarkValidator.validateCreating(req.body).then(data => {
      BookmarkBusiness.create(data,req.user).then(function(bookmark) {
        res.status(200).json(bookmark);
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
   * Get a single Bookmark
   */
  static show(req, res, next) {
    BookmarkBusiness.findOne({_id: req.params.id})
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).end();
      }
      res.json(bookmark);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single Bookmark
   */
  static update(req, res, next) {
    BookmarkValidator.validateUpdating(req.body).then(data => {
      BookmarkBusiness.findOne({_id: req.params.id}).then(bookmark => {

        if(!bookmark) {
          return validationError(res, 404)({message: 'Not found'});
        }
        if(data._id) {
          delete data._id;
        }
        bookmark = _.merge(bookmark, data);
        BookmarkBusiness.update(bookmark).then(function(bookmark) {
            return res.status(200).json(bookmark);
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
   * Deletes a Bookmark
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id,
      user: req.user._id
    }
    BookmarkBusiness.findOne(condition).then(
      bookmark => {
        if(!bookmark) {
          return res.status(404,'Not found').end();
        }
        BookmarkBusiness.removeById(bookmark._id)
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

module.exports = BookmarkController;
