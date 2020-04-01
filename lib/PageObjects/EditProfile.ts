class EditProfile {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(version) {
		this.version = version;
		this.url = `https://twitter.com/settings/profile`
	}

	get saveProfileEdits() {
		return "//span[text()='Save']"
	}

	get editWebsite() {
		return "input[placeholder='Add your website']"
	}
}

module.exports = new EditProfile();