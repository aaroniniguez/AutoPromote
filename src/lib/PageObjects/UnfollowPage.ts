export default class UnfollowPage {
	url: string;
	version: string;
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(public username: string, version? : string) {
		this.version = version;
		this.url = `https://twitter.com/${username}/following`;
	}

	get whoToUnfollow() {
		return "//span[text()='Following']";
	}

}