import Page from "./Page";

class NotificationsPage extends Page {

    url = "https://twitter.com/notifications/mentions";

    get getHearts() {
        return "div[aria-label='Like']";
    }
}

export default new NotificationsPage();