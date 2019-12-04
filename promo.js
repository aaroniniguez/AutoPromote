var twitter = require("./lib/Twitter.js");
let Stocks = require("./lib/Stock.js")
let twitterAccounts = require("./secret.js")
let promotionManager = require("./lib/Promos.js") 
let jesus = twitterAccounts.Jesus;
let own = twitterAccounts.OwnAccount
let robinHood = twitterAccounts.RobinHoodPromo;
let chick = twitterAccounts.richardFeynman;
let randomPromotion = promotionManager.getRandomTextPromotion()
function tweetPromo() {
	let currentDate = new Date();
	let currentDayValue = currentDate.getDate()
	//odd days use the jesus account
	if(currentDayValue % 2) {
		jesusTwitter = new twitter(jesus.credentials)
		jesusTwitter
			.tweet(randomPromotion.message, uploadFile = randomPromotion.image)
			.then(() => jesusTwitter.close())
	//even days use the robinhood account
	} else {
		robinHoodTwitter = new twitter(robinHood.credentials)
		robinHoodTwitter
			.tweet(randomPromotion.message, uploadFile = randomPromotion.image)
			.then(() => robinHoodTwitter.close())
	}
}
async function tweetQuote() {
	function handleDBError(error) {
		console.log(error);
		process.exit();
	}
	let rowsPromise = Stocks.getQuotes(4);
	let rows = await rowsPromise
	Stocks.close()
	let accounts = [
		jesus,
		chick,
		robinHood
	];
	let tasks = [];
	accounts.forEach(account => {
		let accountTwitter = new twitter(account.credentials)
		let accountActions = 
			accountTwitter
				.tweet(rows.shift()["quote"])
				.then(() => accountTwitter.followRandomPeople())
				.catch((e) => console.trace(e))
				.finally(() => accountTwitter.close())
		tasks.push(accountActions)
	});
	console.log(tasks)
	await Promise.all(tasks)
}
if(process.argv[2] == "promo") {
	tweetPromo();
}
else if(process.argv[2] == "quote") {
	tweetQuote();
}