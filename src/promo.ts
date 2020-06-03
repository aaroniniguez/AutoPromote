const log = require('why-is-node-running');
require("dotenv").config();
import twitter from "./lib/Twitter";
import Stock from "./lib/DAO/Stock";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccounts";
import { TwitterAccountDBRecord } from "./lib/interfaces";
import PostMatesPromos from "./lib/DAO/Postmates";
let TwitterAccountDAO = new TwitterAccountsDAO();
let promotionManager = require("./lib/Promos") 
let randomImagePromo = promotionManager.getRandomImagePromotion()
let randomTextPromo = promotionManager.getRandomTextPromotion()
const debugMode = process.argv[3] === "debug" ? true : false;
if(debugMode) {
	//let DB = new database("localhost", "root", "stock");
	//console.log("hi");
	//(async function () {
	//	let users = await getAllTwitterAccounts();
	//	let testUser = users[1];
	//	console.log(testUser);
	//	let twitterAccount = new twitter(testUser.username, testUser.password);
	//	await twitterAccount.saveFollowerCount(DB);
	//	twitterAccount.close();
	//})();
}
async function setupAccounts() {
	let tasks: Promise<any>[] = [];
	let twitterAccounts = await TwitterAccountDAO.getAllTwitterAccounts();
	TwitterAccountDAO.cleanup()
	twitterAccounts.forEach((credentials: TwitterAccountDBRecord) => {
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
	let PostMatesPromosDAO = new PostMatesPromos()
	let post = await PostMatesPromosDAO.getRandomTweet()
	PostMatesPromosDAO.cleanup()
	let twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByType("postmates");
	twitterAccounts.forEach((twitterAccountInfo) => {
		let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
		twitterAccount
			.tweet(post)
			.then(() => twitterAccount.followRandomPeople())
			.then(() => twitterAccount.close())
	});
	TwitterAccountDAO.cleanup()
}

async function tweetPromo() {
	let currentDate = new Date();
	let currentDayValue = currentDate.getDate()
	let account, promotion;
	if(currentDayValue % 2) {
		account = "StockJesus";
		promotion = randomTextPromo;
	} else {
		account = "joo11244620";
		promotion = randomImagePromo;
	}
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccount(account);
	TwitterAccountDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotion.message, promotion.image)
		.then(() => twitterAccount.saveFollowingCount())
		.then(() => twitterAccount.saveFollowerCount())
		.then(() => twitterAccount.close())
}

async function tweetQuote() {
	//TODO: in future , pass in db object...
	// let twitterAccounts = await TwitterAccountDAO.getTwitterAccount("MarkZion19");
	let StockQuotes = new Stock()
	let twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByType("tradenet");
	let rowsPromise = StockQuotes.getQuotes(twitterAccounts.length);
	let rows = await rowsPromise
	TwitterAccountDAO.cleanup();
	StockQuotes.cleanup()
	let tasks : Promise<any>[] = [];
	twitterAccounts.forEach(twitterAccount => {
		let accountTwitter = new twitter(twitterAccount.username, twitterAccount.password)
		let accountActions = 
			accountTwitter
				.updateSuspendedFlag()
				.then(() => accountTwitter.tweet(rows.shift()["quote"]))
				.then(() => accountTwitter.sendMessageOnDMRequest())
				.then(() => accountTwitter.saveFollowingCount())
				.then(() => accountTwitter.saveFollowerCount())
				.then(() => accountTwitter.followRandomPeople())
				.catch((e) => console.trace(e))
				.finally(() => accountTwitter.close())
		tasks.push(accountActions)
	});
	await Promise.all(tasks)
}
let adminAction = process.argv[2];
switch(adminAction) {
	case "promo": 
		tweetPromo();
		break;
	case "quote":
		tweetQuote();
		break;
	case "config":
		setupAccounts()
		break;
	case "postmates": 
		//do something
		tweetPostmates()
		break;
	default: 
		console.log("Invalid Action")
}