import Page from "./Page";

class LoginPage extends Page {
	validLoginPages: string[];

	constructor() {
		super()
		this.url = "https://twitter.com/login",
		this.validLoginPages = [
			"https://twitter.com/home",
			"https://twitter.com/"
		];
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

module.exports = new LoginPage();