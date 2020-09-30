'use strict';

import express from 'express';
import passport from 'passport';
import { signToken } from '../auth.service';
import { PerformerModel, GUserModel } from '../../models';

var router = express.Router();

router.post('/', function(req, res, next) {
  console.log('start hit');
  
  if (req.body.type === 'performer') {
  console.log('performer hit');

    if (!req.body.email) {
      return res.status(400);
    }

    return PerformerModel.findOne({
      email: req.body.email.toLowerCase()
    }, function(err, performer) {
      if (err) {
        return res.status(401).send({
          verified: false
        });
      }

      if (!performer) {
        return res.status(404).send({
          isExist: false
        });
      }

      if (!performer.isVerified) {
        return res.status(401).send({
          idVerified: false
        });
      }
      if (!performer.emailVerified) {
        return res.status(401).send({
          emailVerified: false
        });
      }
      if ( performer.status === 'inactive') {
        return res.status(401).send({
          isActive: false
        });
      }

      performer.authenticate(req.body.password, function(err, isCorrect) {
        if (err || !isCorrect) {
          return res.status(401).send({
            verified: false
          });;
        }

        var token = signToken(performer._id, 'performer');
        res.json({ token });
      });
    });
  }else if (req.body.type === 'getmycontent') {
    console.log('getmycontent hit');
  
      if (!req.body.email) {
        return res.status(400);
      }
  
      return GUserModel.findOne({
        email: req.body.email.toLowerCase()
      }, function(err, guser) {
        if (err) {
          return res.status(401).send({
            verified: false
          });
        }
  
        if (!guser) {
          return res.status(404).send({
            isExist: false
          });
        }
  
        if (!guser.emailVerified) {
          return res.status(401).send({
            emailVerified: false
          });
        }

        if ( guser.status === 'inactive') {
          return res.status(401).send({
            isActive: false
          });
        }
  
        guser.authenticate(req.body.password, function(err, isCorrect) {
          if (err || !isCorrect) {
            return res.status(401).send({
              verified: false
            });;
          }
  
          var token = signToken(guser._id, 'guser');
          res.json({ token , guser:guser});
        });
      });
    }


  passport.authenticate('local', function(err, user, info) {
  console.log('user--->',user);

    var error = err || info;
    if (error || !user.emailVerified) {
      return res.status(401).send({
        verified: false
      });
    }
    if (!user) {
      return res.status(404).json({message: 'No user found'});
    }
//    if(user.role=='admin'){
//      return res.status(404).json({message: 'Your role is admin. Please create new account.'});
//    }
    var token = signToken(user._id, user.role);
    res.json({ token });
  })(req, res, next);
});

export default router;
