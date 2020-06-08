import Page from "./Page";

class MessagesPage extends Page {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(public version?: string) {
		super()
		this.url = `https://twitter.com/messages/requests`;
	}

	get dmRequests() {
		return `div[aria-label='Timeline: Message requests']`;
	}
}

module.exports = new MessagesPage();