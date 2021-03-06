import Page from "./Page";

export default class ProfilePage extends Page {

	constructor(public username: string) {
		super()
		this.username = username;
		this.url = `https://twitter.com/${username}`
	}

	get numberFollowing() {
		return `a[href='/${this.username}/following']`;
	}

	get editProfile() {
		return "//span[text()='Edit profile']";
	}

	get numberOfFollowers() {
		return `a[href='/${this.username}/followers']`;
	}

	get isAcccountSuspended() {
		return "//span[text()='Account suspended']"
	}
}