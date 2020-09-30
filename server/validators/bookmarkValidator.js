import joibird from 'joibird';

class BookmarkValidator {
	//validate create new data
	static validateCreating(body)  {
		var schema = joibird.object().keys({
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
      type: joibird.string().required()
    });
		return joibird.validate(body, schema, {
			stripUnknown: true,
			allowUnknown: true,
			abortEarly: false
		});
	}
}

module.exports = BookmarkValidator;
