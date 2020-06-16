require("dotenv").config();
import twitter from "./lib/Twitter";
import StockDAO from "./lib/DAO/StockDAO";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import PostMatesPromosDAO from "./lib/DAO/PostmatesDAO";
let TwitterAccountDAO = new TwitterAccountsDAO();
import promotionManager from "./lib/Promos";
async function setupAccounts() {
	let tasks: Promise<any>[] = [];
	let twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByType("tradenet");
	TwitterAccountDAO.cleanup()
	twitterAccounts.forEach((credentials) => {
		let twitterAccount  = new twitter(credentials.username, credentials.password);
		let actions = twitterAccount
			.changeWebsiteTo("https://tradeforthemoney.com")
			.catch((e: any) => {console.log(e);})
			.finally(() => twitterAccount.close())
		tasks.push(actions);
	});
	await Promise.all(tasks);
}

async function tweetPostmates() {
	let postMatesPromosDAO = new PostMatesPromosDAO()
	let post = await postMatesPromosDAO.getRandomTweet()
	postMatesPromosDAO.cleanup()
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("postmates");
	TwitterAccountDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(post)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => twitterAccount.close())
}

async function tweetTradenet() {
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("tradenet");
	TwitterAccountDAO.cleanup()
	let promotion = promotionManager.getRandomPromotion()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotion.message, promotion.image)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => twitterAccount.close())
}
//TODO: in future , pass in db object...
async function tweetQuote() {
	let stockDAO = new StockDAO()
	let twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByType("tradenet");
	let rowsPromise = stockDAO.getQuotes(twitterAccounts.length);
	let rows = await rowsPromise
	TwitterAccountDAO.cleanup();
	stockDAO.cleanup()
	let tasks : Promise<any>[] = [];
	twitterAccounts.forEach(twitterAccountInfo => {
		let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
		let accountActions = 
			twitterAccount
				.update()
				.then(() => twitterAccount.tweet(rows.shift()["quote"]))
				.catch((e) => console.trace(e))
				.finally(() => twitterAccount.close())
		tasks.push(accountActions)
	});
	await Promise.all(tasks)
}

async function testing() {
	let twitterAccount = await TwitterAccountDAO.getTwitterAccount("joo11244620");
	TwitterAccountDAO.cleanup();
	let account = new twitter(twitterAccount.username, twitterAccount.password);
	await account
		.likeAllNotifications()
		.then(() => account.close())
		.catch((e) => console.log(e));

}

let adminAction = process.argv[2];
switch(adminAction) {
	case "tradenet": 
		tweetTradenet();
		break;
	case "quote":
		tweetQuote();
		break;
	case "config":
		setupAccounts()
		break;
	case "postmates": 
		tweetPostmates()
		break;
	case "testing": 
		testing();
		break;
	default: 
		console.log("Invalid Action")
}