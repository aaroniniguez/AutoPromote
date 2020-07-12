require("dotenv").config();
import twitter from "./lib/Twitter";
import StockDAO from "./lib/DAO/StockDAO";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import PromotionsDAO from "./lib/DAO/PromotionsDAO";
async function setupAccounts() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
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

async function tweetAirbnb() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("airbnb");
	TwitterAccountDAO.cleanup()
	let promotionsDAO = new PromotionsDAO()
	let promotionInfo = await promotionsDAO.getRandomTweet("airbnb");
	await promotionsDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => {
			twitterAccount.close();
		})
}
async function tweetPostmates() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let promotionsDAO = new PromotionsDAO()
	let promotionInfo = await promotionsDAO.getRandomTweet("postmates");
	await promotionsDAO.cleanup()
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("postmates");
	TwitterAccountDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => {
			twitterAccount.close();
		})
}

async function tweetTradenet() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("tradenet");
	TwitterAccountDAO.cleanup()
	let promotionsDAO = new PromotionsDAO()
	let promotionInfo = await promotionsDAO.getRandomTweet("tradenet");
	promotionsDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => twitterAccount.close())
}
//TODO: in future , pass in db object...
async function tweetQuote() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
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
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccount = await TwitterAccountDAO.getTwitterAccount("joo11244620");
	TwitterAccountDAO.cleanup();
	let account = new twitter(twitterAccount.username, twitterAccount.password);
	await account
		.likeAllNotifications()
		.then(() => account.close())
		.catch((e) => console.log(e));

}

async function loginDebug(username: string) {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccount = await TwitterAccountDAO.getTwitterAccount(username)
	TwitterAccountDAO.cleanup();
	let account = new twitter(twitterAccount.username, twitterAccount.password);
	await account
		.login()
		.catch((e) => console.log(e));
}

export function promote(promotion: string) {
	switch(promotion) {
		case "airbnb":
			tweetAirbnb()
			break;
		case "tradenet": 
			tweetTradenet();
			break;
		case "postmates": 
			tweetPostmates()
			break;
		default:
			console.log("Invalid Promotion")
	}
}

// let adminAction = process.argv[2];
// switch(adminAction) {
// 	case "login":
// 		loginDebug(process.argv[3])
// 		break;
// 	case "airbnb":
// 		tweetAirbnb()
// 		break;
// 	case "tradenet": 
// 		tweetTradenet();
// 		break;
// 	case "quote":
// 		tweetQuote();
// 		break;
// 	case "config":
// 		setupAccounts()
// 		break;
// 	case "postmates": 
// 		tweetPostmates()
// 		break;
// 	case "testing": 
// 		testing();
// 		break;
// 	default: 
// 		console.log("Invalid Action")
// }