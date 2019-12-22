var twitter = require("./lib/Twitter.js");
let Stocks = require("./lib/Stock.js")
let twitterAccounts = require("./secret.js")
let promotionManager = require("./lib/Promos.js") 
let randomImagePromo = promotionManager.getRandomImagePromotion()
let randomTextPromo = promotionManager.getRandomTextPromotion()
async function setupAccounts() {
	let tasks = [];
	for(let [accountType, accountInfo] of Object.entries(twitterAccounts)) {
		let twitterAccount = new twitter(accountInfo)
		console.log(twitterAccount)
		let actions = twitterAccount
			.changeWebsiteTo("https://tradeforthemoney.com")
			.catch((e) => {console.log(e);})
		tasks.push(actions);
	}
	await Promise.all(tasks);
}
setupAccounts()
function tweetPromo() {
	let currentDate = new Date();
	let currentDayValue = currentDate.getDate()
	//odd days use the jesus account
	if(currentDayValue % 2) {
		jesusTwitter = new twitter(twitterAccounts["promoText"])
		jesusTwitter
			.tweet(randomTextPromo.message, uploadFile = randomTextPromo.image)
			.then(() => jesusTwitter.close())
	//even days use the robinhood account
	} else {
		TraderShyTwitter = new twitter(twitterAccounts["promoImage"])
		TraderShyTwitter
			.tweet(randomTextPromo.message, uploadFile = randomTextPromo.image)
			.then(() => TraderShyTwitter.close())
	}
}
async function tweetQuote() {
	let rowsPromise = Stocks.getQuotes(Object.keys(twitterAccounts).length);
	let rows = await rowsPromise
	Stocks.close()
	let tasks = [];
	for(let [accountType, accountInfo] of Object.entries(twitterAccounts)) {
		let accountTwitter = new twitter(accountInfo)
		let accountActions = 
			accountTwitter
				.tweet(rows.shift()["quote"])
				.then(() => accountTwitter.followRandomPeople())
				.catch((e) => console.trace(e))
				.finally(() => accountTwitter.close())
		tasks.push(accountActions)
	};
	await Promise.all(tasks)
}
if(process.argv[2] == "promo") {
	tweetPromo();
}
else if(process.argv[2] == "quote") {
	tweetQuote();
}