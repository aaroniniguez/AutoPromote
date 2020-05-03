class FollowPage {
	url: string;
	version: string;
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(version?: string) {
		this.version = version;
		this.url = "https://twitter.com/i/connect_people"
	}

	get whoToFollow() {
		return "//span[text()='Follow']";
	}

}

module.exports = new FollowPage();