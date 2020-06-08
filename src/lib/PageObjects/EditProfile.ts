import Page from "./Page";

class EditProfile extends Page {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(public version?: string) {
		super()
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