var twitter = require("./lib/Twitter.js");
let Stocks = require("./lib/Stock.js")
let twitterAccounts = require("./secret.js")
let promotionManager = require("./lib/Promos.js") 
let randomImagePromo = promotionManager.getRandomImagePromotion()
let randomTextPromo = promotionManager.getRandomTextPromotion()
async function setupAccounts() {
	let tasks = [];
	Object.entries(twitterAccounts).forEach(credentials => {
		let twitterAccount = new twitter(credentials)
		let actions = twitterAccount
			.changeWebsiteTo("https://tradeforthemoney.com")
			.catch((e) => {console.log(e);})
		tasks.push(actions);
	});
	await Promise.all(tasks);
}
function tweetPromo() {
	let currentDate = new Date();
	let currentDayValue = currentDate.getDate()
	//odd days use the jesus account
	if(currentDayValue % 2) {
		let credentials = [
			"stockJesus",
			twitterAccounts["stockJesus"]
		]
		jesusTwitter = new twitter(credentials)
		jesusTwitter
			.tweet(randomTextPromo.message, uploadFile = randomTextPromo.image)
			.then(() => jesusTwitter.close())
	//even days use the robinhood account
	} else {
		let credentials = [
			"TraderShy",
			twitterAccounts["TraderShy"]
		]
		TraderShyTwitter = new twitter(credentials)
		TraderShyTwitter
			.tweet(randomTextPromo.message, uploadFile = randomTextPromo.image)
			.then(() => TraderShyTwitter.close())
	}
	let credentials = [
		"ProRobinHoodTr1",
		twitterAccounts["ProRobinHoodTr1"]
	]
	imagePromoAccount = new twitter(credentials)
	imagePromoAccount
		.tweet(randomImagePromo.message, randomImagePromo.image)
		.then(()=> imagePromoAccount.close())
}
async function tweetQuote() {
	let rowsPromise = Stocks.getQuotes(Object.keys(twitterAccounts).length);
	let rows = await rowsPromise
	Stocks.close()
	let tasks = [];
	Object.entries(twitterAccounts).forEach(credentials => {
		let accountTwitter = new twitter(credentials)
		let accountActions = 
			accountTwitter
				.tweet(rows.shift()["quote"])
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