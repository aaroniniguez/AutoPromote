import Page from "./Page";

export default class ProfilePage extends Page {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(public username: string) {
		super()
		this.url = `https://twitter.com/${username}`
		this.username = username;
	}

	get numberFollowing() {
		return `a[href='/${this.username}/following']`;
	}

	get editProfile() {
		return "//span[text()='Edit profile']";
	}

	get editWebsite() {
		return "input[placeholder='Add your website']"
	}

	get numberOfFollowers() {
		return `a[href='/${this.username}/followers']`;
	}

	get saveProfileEdits() {
		return "//span[text()='Save']"
	}

	get isAcccountSuspended() {
		return "//span[text()='Account suspended']"
	}
}