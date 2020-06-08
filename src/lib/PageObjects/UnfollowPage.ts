import Page from "./Page";

export default class UnfollowPage extends Page{
	version: string;
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(public username: string, version? : string) {
		super()
		this.version = version;
		this.url = `https://twitter.com/${username}/following`;
	}

	get whoToUnfollow() {
		return "//span[text()='Following']";
	}

}