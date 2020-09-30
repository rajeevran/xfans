import joibird from 'joibird';

exports.validateFind = function(params){
	var schema = joibird.object().keys({
      keyword: joibird.string(),
      limit: joibird.number().integer().min(1),
      offset: joibird.number().min(0),
      sort: joibird.string(),
			performerId: joibird.string(),
      order: joibird.number().integer().min(-1).max(1),
      id: joibird.string()
  });

  return joibird.validate(params, schema, {
		stripUnknown: false,
		allowUnknown: true,
		abortEarly: false
	});
};

exports.validateCreating = function(body)  {
	var schema = joibird.object().keys({
      title: joibird.string().min(2).required(),
      description: joibird.string(),
      status: joibird.string()
  });
	return joibird.validate(body, schema, {
		stripUnknown: false,
		allowUnknown: true,
		abortEarly: false
	});
};

exports.validateUpdating = function(body)  {
    var schema = joibird.object().keys({
      title: joibird.string().min(2).required(),
      description: joibird.string(),
      status: joibird.string()
  });
	return joibird.validate(body, schema, {
		stripUnknown: true,
		allowUnknown: true,
		abortEarly: false
	});
};
