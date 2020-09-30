'use strict';

import { RequestLog } from '../../models';

exports.log = function(req, res, next) {
  let log = new RequestLog({
    path: req.url,
    query: req.query,
    reqHeader: req.headers,
    reqBody: req.body
  });

  log.save(() => next());
};
