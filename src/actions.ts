require("dotenv").config();
import { TwitterPromoter } from "./lib/Twitter";
import StockDAO from "./lib/DAO/StockDAO";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import { promote } from "./promote";
async function setupAccounts() {
	const TwitterAccountDAO = new TwitterAccountsDAO();
	const tasks: Promise<void>[] = [];
	const twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByPromotion(["tradenet"]);
	TwitterAccountDAO.cleanup()
	twitterAccounts.forEach((credentials) => {
		const twitterAccount  = new TwitterPromoter(credentials.username, credentials.password);
		const actions = twitterAccount
			.changeWebsiteTo("https://tradeforthemoney.com")
			.catch(e => {console.log(e);})
			.finally(() => twitterAccount.close())
		tasks.push(actions);
	});
	await Promise.all(tasks);
}

//TODO: in future , pass in db object...
async function tweetQuote() {
	const TwitterAccountDAO = new TwitterAccountsDAO();
	const stockDAO = new StockDAO()
	const twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByPromotion(["tradenet","chase", "chase_unlimited", "amex"]);
	const rowsPromise = stockDAO.getQuotes(twitterAccounts.length);
	const rows = await rowsPromise
	TwitterAccountDAO.cleanup();
	stockDAO.cleanup()
	const tasks : Promise<void>[] = [];
	twitterAccounts.forEach(twitterAccountInfo => {
		const twitterAccount = new TwitterPromoter(twitterAccountInfo.username, twitterAccountInfo.password)
		const accountActions = 
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
	const TwitterAccountDAO = new TwitterAccountsDAO();
	const twitterAccount = await TwitterAccountDAO.getTwitterAccount("joo11244620");
	TwitterAccountDAO.cleanup();
	const account = new TwitterPromoter(twitterAccount.username, twitterAccount.password, false);
	await account
		.changeWebsiteTo('https://www.referyourchasecard.com/18f/FGZYL1E0HY')
		.then(() => account.close())
		.catch((e) => console.log(e));
}

async function login(username: string) {
	const TwitterAccountDAO = new TwitterAccountsDAO();
	const twitterAccount = await TwitterAccountDAO.getTwitterAccount(username)
	TwitterAccountDAO.cleanup();
	const account = new TwitterPromoter(twitterAccount.username, twitterAccount.password, false);
	await account
		.login()
		.catch((e) => console.log(e));
}

const adminAction = process.argv[2];
switch(adminAction) {
	case "login":
		login(process.argv[3])
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
	case "promote": 
		if(!process.argv[3]) {
			console.log("promote action must have a promotion argument")
		} else {
			promote(process.argv[3], false);
		}
		break;
	default: 
		console.log("Invalid Action");
}