class UISelectors {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(version) {
		this.version = version;
	}

	numberFollowing(username) {
		return `a[href='/${username}/following']`;
	}

	get editProfile() {
		return "//span[text()='Edit profile']";
	}

	get editWebsite() {
		return "input[placeholder='Add your website']"
	}

	get saveProfileEdits() {
		return "//span[text()='Save']"
	}

	get whoToFollow() {
		return "//span[text()='Follow']";
	}

	numberOfFollowers(username) {
		return `a[href='/${username}/followers']`;
	}

	get dmRequests() {
		return `div[aria-label="Timeline: Message requests"]`;
	}

	get username() {
		return "input[name='session[username_or_email]']";
	}

	get password() {
		//const passwordSelector = "input.js-password-field"
		return "input[name='session[password]']";
	}

	/**
	 * returns xpath expression
	 */
	get loginButton() {
		//await this.page.waitForXPath("//button[text()='Log in']").then((EH)=>EH.click());
		return "//span[text()='Log in']";
	}

}

module.exports = UISelectors;