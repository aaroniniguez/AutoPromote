const log = require('why-is-node-running');
require("dotenv").config();
import twitter from "./lib/Twitter";
import Stocks from "./lib/DAO/Stock";
import database from "./lib/Database";
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
	let tasks = [];
	for(let [accountType, accountInfo] of Object.entries(twitterAccounts)) {
		let twitterAccount = new twitter(accountInfo)
		let actions = twitterAccount
			.changeWebsiteTo("https://tradeforthemoney.com")
			.catch((e) => {console.log(e);})
		tasks.push(actions);
	}
	await Promise.all(tasks);
}
async function tweetPromo() {
	let DB = new database("localhost", "root", "stock");
	let currentDate = new Date();
	let currentDayValue = currentDate.getDate()
	let twitterAccounts = await Stocks.getAllTwitterAccounts();
	//odd days use the jesus account
	if(currentDayValue % 2) {
		let jesusTwitter = new twitter(twitterAccounts[1].username, twitterAccounts[1].password)
		jesusTwitter
			.tweet(randomTextPromo.message, randomTextPromo.image)
			.then(() => jesusTwitter.saveFollowingCount(DB))
			.then(() => jesusTwitter.saveFollowerCount(DB))
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
	let DB = new database("localhost", "root", "stock");
	let twitterAccounts = await Stocks.getAllTwitterAccounts();
	let rowsPromise = Stocks.getQuotes(twitterAccounts.length);
	let rows = await rowsPromise
	let tasks = [];
	twitterAccounts.forEach(twitterAccount => {
		let accountTwitter = new twitter(twitterAccount.username, twitterAccount.password)
		let accountActions = 
			accountTwitter
				.tweet(rows.shift()["quote"])
				.then(() => accountTwitter.sendMessageOnDMRequest())
				.then(() => accountTwitter.saveFollowingCount(DB))
				.then(() => accountTwitter.saveFollowerCount(DB))
				.then(() => accountTwitter.followRandomPeople())
				.catch((e) => console.trace(e))
				.finally(() => accountTwitter.close())
		tasks.push(accountActions)
	});
	await Promise.all(tasks)
}
if(process.argv[2] == "promo") {
	tweetPromo();
}
else if(process.argv[2] == "quote") {
	tweetQuote();
}