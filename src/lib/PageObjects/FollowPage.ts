import Page from "./Page";

class FollowPage extends Page {
	version: string;
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(version?: string) {
		super();
		this.version = version;
		this.url = "https://twitter.com/i/connect_people"
	}

	get whoToFollow() {
		return "//span[text()='Follow']";
	}

}

module.exports = new FollowPage();