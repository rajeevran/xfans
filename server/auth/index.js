'use strict';

import express from 'express';
import passport from 'passport';
import config from '../config/environment';
import { UserModel } from '../models';

// Passport Configuration
require('./local/passport').setup(UserModel, config);
require('./facebook/passport').setup(UserModel, config);
require('./google/passport').setup(UserModel, config);
require('./twitter/passport').setup(UserModel, config);

var router = express.Router();

router.use('/local', require('./local').default);
router.use('/facebook', require('./facebook').default);
router.use('/twitter', require('./twitter').default);
router.use('/google', require('./google').default);

module.exports = router;