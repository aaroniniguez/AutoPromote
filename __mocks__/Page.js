class Page {
	constructor() {
	}

	goto(url) {
		let returnPromise = new Promise((resolve, reject) => {
			resolve(url);
		})
		return returnPromise;
	}
}

module.exports = Page;