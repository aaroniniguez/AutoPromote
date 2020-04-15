export default class ProfilePage {
	url: string;
	username: string;
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(username) {
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