class UISelectors {
	/**
	 * 
	 * @param {String} version either mobile or desktop
	 */
	constructor(version) {
		this.version = version;
	}

	getUsernameSelector() {
		return "input[name='session[username_or_email]']";
	}

	getPasswordSelector() {
		//const passwordSelector = "input.js-password-field"
		return "input[name='session[password]']";
	}

	/**
	 * returns xpath expression
	 */
	getLoginButton() {
		//await this.page.waitForXPath("//button[text()='Log in']").then((EH)=>EH.click());
		return "//span[text()='Log in']";
	}

}

module.exports = UISelectors;