import Page from "./Page";

class EditProfilePage extends Page {

	url = 'https://twitter.com/settings/profile';
    
    get editWebsite() {
		return "input[name='url'";
    }
    
	get saveProfileEdits() {
		return "//span[text()='Save']"
	}

}

export default new EditProfilePage();