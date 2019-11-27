var twitter = require("./lib/Twitter.js");
let Stocks = require("./lib/Stock.js")
let twitterAccounts = require("./secret.js")
let promotionManager = require("./lib/Promos.js") 
let jesus = twitterAccounts.Jesus;
let own = twitterAccounts.OwnAccount
let robinHood = twitterAccounts.RobinHoodPromo;
let chick = twitterAccounts.chickPromo;
let randomPromotion = promotionManager.getRandomTextPromotion()
function tweetPromo() {
	jesusTwitter = new twitter(jesus.credentials)
		jesusTwitter
			.tweet(randomPromotion.message, uploadFile = randomPromotion.image)
			.then(() => jesusTwitter.close())
	//twitter.tweet(robinHood.credentials, robinHood.message, uploadFile = false, randomFollow = true);
	//twitter.tweet(chick.credentials, chick.message, uploadFile = false, randomFollow = true);
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