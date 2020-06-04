class MessagesPage {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	public url: string;
	constructor(public version?: string) {
		this.url = `https://twitter.com/messages/requests`;
	}

	get dmRequests() {
		return `div[aria-label='Timeline: Message requests']`;
	}
}

module.exports = new MessagesPage();