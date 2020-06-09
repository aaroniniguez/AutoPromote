import Page from "./Page";

class MessagesPage extends Page {
	
	url = `https://twitter.com/messages/requests`;

	get dmRequests() {
		return `div[aria-label='Timeline: Message requests']`;
	}
}

export default new MessagesPage();