import joibird from 'joibird';

class GUserValidator {
	//validate create new data
	static validateCreating(body)  {
		var schema = joibird.object().keys({
	    email: joibird.string().email().required().options({
	    	language: {
	    		key: 'Email '
	    	}
	    }),
	    password: joibird.string().min(6).options({
	    	language: {
	    		key: 'Password ',
	    		string: {
	    			min: 'must be greater than or equal to 6 characters'
	    		}
	    	}
	    }),
	    name: joibird.string().min(2).options({
	    	language: {
	    		key: 'Name ',
	    		string: {
	    			min: 'must be greater than or equal to 2 characters'
	    		}
	    	}
	    })
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}

	static validateResetPassword(body)  {
		var schema = joibird.object().keys({
	    password: joibird.string().min(6).required().options({
	    	language: {
	    		key: 'Password ',
	    		string: {
	    			min: 'must be greater than or equal to 6 characters'
	    		}
	    	}
	    }),
	    confirmPassword: joibird.any().valid(joibird.ref('password')).required().options({
	    	language: {
	    		key: 'Confirm Password ',
	    		any: {
	    			allowOnly: 'must be equal to Password'
	    		}
	    	}
	    })
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}

	static validateChangePassword(body) {
		var schema = joibird.object().keys({
			currentPassword: joibird.string().min(6).required().options({
	    	language: {
	    		key: 'Current Password ',
	    		string: {
	    			min: 'must be greater than or equal to 6 characters'
	    		}
	    	}
	    }),
	    password: joibird.string().min(6).required().options({
	    	language: {
	    		key: 'Password ',
	    		string: {
	    			min: 'must be greater than or equal to 6 characters'
	    		}
	    	}
	    }),
	    confirmPassword: joibird.any().valid(joibird.ref('password')).required().options({
	    	language: {
	    		key: 'Confirm Password ',
	    		any: {
	    			allowOnly: 'must be equal to Password'
	    		}
	    	}
	    })
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}

	static validateUpdating(body)  {
		var schema = joibird.object().keys({
	    firstName: joibird.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/).max(40).options({
	    	language: {
	    		key: 'First Name ',
	    		string: {
	    			regex: {
	    				base : 'must be alphabetic',
	    				name: 'must be alphabetic'
	    			},
	    			max: 'must be less than or equal to 40 characters'
	    		}
	    	}
	    }),
	    lastName: joibird.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/).max(40).options({
	    	language: {
	    		key: 'Last Name ',
	    		string: {
	    			regex: {
	    				base : 'must be alphabetic',
	    				name: 'must be alphabetic'
	    			},
	    			max: 'must be less than or equal to 40 characters'
	    		}
	    	}
	    }),
	    cellPhoneNumber: joibird.string().regex(/^\+[0-9]{8,}$/).options({
	    	language: {
	    		key: 'Cell Phone Number ',
	    		string: {
	    			regex: {
	    				base : 'is invalid',
	    				name: 'is invalid'
	    			}
	    		}
	    	}
	    })
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}
}

module.exports = GUserValidator;
