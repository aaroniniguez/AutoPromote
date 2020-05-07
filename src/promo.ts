const log = require('why-is-node-running');
require("dotenv").config();
import twitter from "./lib/Twitter";
import Stock from "./lib/DAO/Stock";
import database from "./lib/Database";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccounts";
import { TwitterAccountDBRecord } from "./lib/interfaces";
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
async function tweetPromo() {
	let currentDate = new Date();
	let currentDayValue = currentDate.getDate()
	let twitterAccounts = await TwitterAccountDAO.getAllTwitterAccounts();
	//odd days use the jesus account
	TwitterAccountDAO.cleanup()
	if(currentDayValue % 2) {
		let jesusTwitter = new twitter(twitterAccounts[1].username, twitterAccounts[1].password)
		jesusTwitter
			.tweet(randomTextPromo.message, randomTextPromo.image)
			.then(() => jesusTwitter.saveFollowingCount())
			.then(() => jesusTwitter.saveFollowerCount())
			.then(() => jesusTwitter.close())
	//even days use the robinhood account
	} else {
		let TraderShyTwitter = new twitter(twitterAccounts[0].username, twitterAccounts[0].password)
		TraderShyTwitter
			.tweet(randomImagePromo.message, randomImagePromo.image)
			.then(() => TraderShyTwitter.isAbleToFollow())
			.then(() => TraderShyTwitter.close())
	}
}

async function tweetQuote() {
	//TODO: in future , pass in db object...
	// let twitterAccounts = await TwitterAccountDAO.getTwitterAccount("MarkZion19");
	let StockQuotes = new Stock()
	let twitterAccounts = await TwitterAccountDAO.getAllTwitterAccounts();
	let rowsPromise = StockQuotes.getQuotes(twitterAccounts.length);
	let rows = await rowsPromise
	TwitterAccountDAO.cleanup();
	StockQuotes.cleanup()
	let tasks = [];
	twitterAccounts.forEach(twitterAccount => {
		let accountTwitter = new twitter(twitterAccount.username, twitterAccount.password)
		let accountActions = 
			accountTwitter
				.isSuspended()
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
	default: 
		console.log("Invalid Action")
}