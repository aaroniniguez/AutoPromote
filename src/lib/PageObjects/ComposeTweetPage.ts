import Page from "./Page";

class ComposeTweetPage extends Page {

	url = 'https://twitter.com/compose/tweet';

	get uploadFile() {
        return "input[type='file']";
	}
}

export default new ComposeTweetPage();