'use strict';

import { CategoryModel } from '../../models';
import { CategoryBusiness } from '../../businesses';
import { CategoryValidator, parseJoiError } from '../../validators';
import { S3, GM } from '../../components';

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

function checkExist(options, cb) {
  var alias = options.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');
  var query = {
    alias: alias
  };
  if (options._id) {
    query._id = {
      $ne: options._id
    };
  }
  CategoryModel.count(query, function(err, count) {
    cb(err, count > 0);
  });
}

class CategoryController {
  /**
   * Get list of Pages
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
			req.query.limit = parseInt(req.query.limit);
		}
		if(req.query.offset!='undefined'){
			req.query.offset = parseInt(req.query.offset);
		}
    return CategoryBusiness.find(req.query)
      .then(categories => {
        res.status(200).json(categories);
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Page
   */
  static create(req, res, next) {
    CategoryValidator.validateCreating(req.body)
      .then(data => {
        checkExist({
          name: req.body.name
        }, function(err, exist) {
          if (err || exist) {
            return res.status(400).send({
              msg: 'Category already exist!'
            });
          }

          CategoryBusiness.create(data)
            .then(function(category) {
              return  res.status(200).json(category);
            })
            .catch(err => {
              validationError(res, 422)(parseJoiError(err));
            });
        });
      })
      .catch(err => {
        validationError(res, 422)(parseJoiError(err));
      });
  }

  /**
   * Get a single Page
   */
  static show(req, res, next) {
    CategoryBusiness.findOne({_id: req.params.id})
    .then(category => {
      if (!category) {
        return res.status(404).end();
      }
      res.json(category);
    })
    .catch(err => next(err));
  }

 /**
   * Get a single Page
   */
 static update(req, res, next) {
   CategoryValidator.validateUpdating(req.body).then(data => {
     CategoryBusiness.findOne({_id: req.params.id}).then(category => {
       if (!category) {
         return res.status(404).send();
       }

       checkExist({
         name: req.body.name,
         _id: category._id
       }, function(err, exist) {
         if (err || exist) {
           return res.status(400).send({
             msg: 'Category already exist!'
           });
         }

         category.name = req.body.name;
         category.status = req.body.status;
         return CategoryBusiness.update(category)
           .then(category => res.status(200).json(category));
       });
     }).catch(err => validationError(res, 422)(parseJoiError(err)));
   }).catch(err => validationError(res, 422)(parseJoiError(err)));
 }

  /**
   * Deletes a Page
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    };
    CategoryBusiness.findOne(condition).then(
      category => {
        if(!category) {
          return res.status(404,'Not found').end();
        }
        category.remove();
        res.status(200,true).end();
      },
      err => handleError(res)
    );
  }
}

module.exports = CategoryController;
