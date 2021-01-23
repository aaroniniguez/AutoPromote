import Page from "./Page";

class LoginPage extends Page {

	validLoginPages: string[];
	tempRestrictedLoginPages: string[];
	url = "https://twitter.com/login";

	constructor() {
		super()
		this.validLoginPages = [
			"https://twitter.com/home",
			"https://twitter.com/",
		];
		// twitter restricts accounts from following and liking if they follow more than 400 a day
		this.tempRestrictedLoginPages = [
			"https://twitter.com/account/access"
		]
	}

	get username() {
		return "input[name='session[username_or_email]']";
	}

	get password() {
		return "input[name='session[password]']";
	}

	get loginButton() {
		return "//span[text()='Log in']";
	}

	get continueToTwitterButton() {
		return "input[value='Continue to Twitter']";	
	}

}

export default new LoginPage();