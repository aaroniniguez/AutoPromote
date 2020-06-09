import Page from "./Page";

export default class UnfollowPage extends Page{

	constructor(public username: string) {
		super()
		this.url = `https://twitter.com/${username}/following`;
	}

	get whoToUnfollow() {
		return "//span[text()='Following']";
	}

}