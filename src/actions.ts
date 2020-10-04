require("dotenv").config();
import { TwitterPromoter } from "./lib/Twitter";
import StockDAO from "./lib/DAO/StockDAO";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import { promote } from "./promote";
async function setupAccounts() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let tasks: Promise<any>[] = [];
	let twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByPromotion(["tradenet"]);
	TwitterAccountDAO.cleanup()
	twitterAccounts.forEach((credentials) => {
		let twitterAccount  = new TwitterPromoter(credentials.username, credentials.password);
		let actions = twitterAccount
			.changeWebsiteTo("https://tradeforthemoney.com")
			.catch((e: any) => {console.log(e);})
			.finally(() => twitterAccount.close())
		tasks.push(actions);
	});
	await Promise.all(tasks);
}

//TODO: in future , pass in db object...
async function tweetQuote() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let stockDAO = new StockDAO()
	let twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByPromotion(["tradenet","chase"]);
	let rowsPromise = stockDAO.getQuotes(twitterAccounts.length);
	let rows = await rowsPromise
	TwitterAccountDAO.cleanup();
	stockDAO.cleanup()
	let tasks : Promise<any>[] = [];
	twitterAccounts.forEach(twitterAccountInfo => {
		let twitterAccount = new TwitterPromoter(twitterAccountInfo.username, twitterAccountInfo.password)
		let accountActions = 
			twitterAccount
				.routineActions()
				.then(() => twitterAccount.tweet(rows.shift()["quote"]))
				.catch((e) => console.trace(e))
				.finally(() => twitterAccount.close())
		tasks.push(accountActions)
	});
	await Promise.all(tasks)
}

async function testing() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccount = await TwitterAccountDAO.getTwitterAccount("joo11244620");
	TwitterAccountDAO.cleanup();
	let account = new TwitterPromoter(twitterAccount.username, twitterAccount.password);
	await account
		.likeAllNotifications()
		.then(() => account.close())
		.catch((e) => console.log(e));
}

async function loginDebug(username: string) {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccount = await TwitterAccountDAO.getTwitterAccount(username)
	TwitterAccountDAO.cleanup();
	let account = new TwitterPromoter(twitterAccount.username, twitterAccount.password);
	await account
		.login()
		.catch((e) => console.log(e));
}

let adminAction = process.argv[2];
switch(adminAction) {
	case "login":
		loginDebug(process.argv[3])
		break;
	case "quote":
		tweetQuote();
		break;
	case "config":
		setupAccounts()
		break;
	case "testing": 
		testing();
		break;
	case "airbnb":
		promote("airbnb");
		break;
	default: 
		console.log("Invalid Action")
}