import joibird from 'joibird';

class SaveVideoValidator {
	//validate create new data
	static validateCreating(body)  {
		var schema = joibird.object().keys({
	    user: joibird.required(),
      video: joibird.required()
		});
		return joibird.validate(body, schema, {
			stripUnknown: false,
			allowUnknown: true,
			abortEarly: false
		});
	}


	static validateUpdating(body)  {
    var schema = joibird.object().keys({
      user: joibird.required(),
      video: joibird.required()
    });
		return joibird.validate(body, schema, {
			stripUnknown: true,
			allowUnknown: true,
			abortEarly: false
		});
	}
}

module.exports = SaveVideoValidator;
