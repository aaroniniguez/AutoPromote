class FollowPage {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(version) {
		this.version = version;
		this.url = "https://twitter.com/who_to_follow"
	}

	get whoToFollow() {
		return "//span[text()='Follow']";
	}

}

module.exports = new FollowPage();