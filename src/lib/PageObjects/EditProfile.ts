import Page from "./Page";

class EditProfile extends Page {

	url = `https://twitter.com/settings/profile`

	get saveProfileEdits() {
		return "//span[text()='Save']"
	}

	get editWebsite() {
		return "input[placeholder='Add your website']"
	}
}

export default new EditProfile();