import Page from "./Page";

class LogoutPage extends Page {

	validLoginPages: string[];
    url = "https://twitter.com/logout";

	constructor() {
		super()
	}

}

export default new LogoutPage();