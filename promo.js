var twitter = require("./lib/Twitter.js");
let Stocks = require("./lib/Stock.js");
let database = require("./lib/Database");
let promotionManager = require("./lib/Promos.js") 
let randomImagePromo = promotionManager.getRandomImagePromotion()
let randomTextPromo = promotionManager.getRandomTextPromotion()
const debugMode = process.argv[3] === "debug" ? true : false;
async function getAllTwitterAccounts(DB) {
	let result = await DB.query("SELECT * FROM twitterAccounts");
	return result;
}
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
	let twitterAccounts = await getAllTwitterAccounts(DB);
	//odd days use the jesus account
	if(currentDayValue % 2) {
		jesusTwitter = new twitter(twitterAccounts[1].username, twitterAccounts[1].password)
		jesusTwitter
			.tweet(randomTextPromo.message, uploadFile = randomTextPromo.image)
			.then(() => jesusTwitter.close())
	//even days use the robinhood account
	} else {
		TraderShyTwitter = new twitter(twitterAccounts[0].username, twitterAccounts[0].password)
		TraderShyTwitter
			.tweet(randomImagePromo.message, uploadFile = randomImagePromo.image)
			.then(() => TraderShyTwitter.close())
	}
}

async function tweetQuote() {
	let DB = new database("localhost", "root", "stock");
	let twitterAccounts = await getAllTwitterAccounts(DB);
	let rowsPromise = Stocks.getQuotes(twitterAccounts.length);
	let rows = await rowsPromise
	Stocks.close()
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