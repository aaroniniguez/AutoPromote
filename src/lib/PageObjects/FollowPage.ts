import Page from "./Page";

class FollowPage extends Page {

	url = "https://twitter.com/i/connect_people";

	get whoToFollow() {
		return "//span[text()='Follow']";
	}

}

export default new FollowPage();