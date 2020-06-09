import Page from "./Page";

class LoginPage extends Page {

	validLoginPages: string[];
	url = "https://twitter.com/login";

	constructor() {
		super()
		this.validLoginPages = [
			"https://twitter.com/home",
			"https://twitter.com/"
		];
	}

	get username() {
		return "input[name='session[username_or_email]']";
	}

	get password() {
		// old version: const passwordSelector = "input.js-password-field"
		return "input[name='session[password]']";
	}

	get loginButton() {
		// old version: await this.page.waitForXPath("//button[text()='Log in']").then((EH)=>EH.click());
		return "//span[text()='Log in']";
	}

}

export default new LoginPage();