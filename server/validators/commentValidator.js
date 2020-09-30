import joibird from 'joibird';

class CommentValidator {
	//validate create new data
	static validateCreating(body)  {
		var schema = joibird.object().keys({
	    content: joibird.string().min(6).required()
		});
		return joibird.validate(body, schema, {
			stripUnknown: false,
			allowUnknown: true,
			abortEarly: false
		});
	}


	static validateUpdating(body)  {
    var schema = joibird.object().keys({
      content: joibird.string().min(6).required()
    });
		return joibird.validate(body, schema, {
			stripUnknown: true,
			allowUnknown: true,
			abortEarly: false
		});
	}
}

module.exports = CommentValidator;
