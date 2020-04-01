class MessagesPage {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(version) {
		this.version = version;
		this.url = `https://twitter.com/messages/requests`;
	}

	get dmRequests() {
		return `div[aria-label='Timeline: Message requests']`;
	}
}

module.exports = new MessagesPage();