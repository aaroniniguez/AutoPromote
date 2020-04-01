module.exports = class ElementNotFound extends Error {
	constructor(message) {
		super(message);
		if(Error.captureStackTrace) {
			Error.captureStackTrace(this, ElementNotFound);
		}
		this.name = "Element Not Found"
	}
}
