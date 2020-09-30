import joibird from 'joibird';

class OrderValidator {
	//validate create new data
	static validateCreating(body)  {
		var schema = joibird.object().keys({
	    type: joibird.required()

		});
		return joibird.validate(body, schema, {
			stripUnknown: false,
			allowUnknown: true,
			abortEarly: false
		});
	}


	static validateUpdating(body)  {
    var schema = joibird.object().keys({
      type: joibird.required()
    });
		return joibird.validate(body, schema, {
			stripUnknown: true,
			allowUnknown: true,
			abortEarly: false
		});
	}
}

module.exports = OrderValidator;
