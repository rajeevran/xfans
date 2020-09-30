import joibird from 'joibird';

class NotificationValidator {
	//validate create new data
	static validateCreating(body)  {
		var schema = joibird.object().keys({
	    name: joibird.string().min(2).required(),
      type: joibird.string().required()
		});
		return joibird.validate(body, schema, {
			stripUnknown: false,
			allowUnknown: true,
			abortEarly: false
		});
	}


	static validateUpdating(body)  {
    var schema = joibird.object().keys({
      name: joibird.string().min(2).required(),
      price: joibird.number().integer().required()
    });
		return joibird.validate(body, schema, {
			stripUnknown: true,
			allowUnknown: true,
			abortEarly: false
		});
	}
}

module.exports = NotificationValidator;
