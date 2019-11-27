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
	//let privateTwitter = new twitter(own.credentials)
	//let privateTweet = 
		//privateTwitter
			//.changeWebsiteTo("https://tradeforthemoney.com")
			//.catch((e) => console.trace(e))
			//.finally(() => privateTwitter.close())
	//await privateTweet
	let jesusTwitter = new twitter(jesus.credentials)
	let jesusTweet = 
		jesusTwitter
			.tweet(rows.shift()["quote"])
			.then(() => jesusTwitter.followRandomPeople())
			.catch((e) => console.trace(e))
			.finally(() => jesusTwitter.close())
	await jesusTweet
	let robinHoodTwitter = new twitter(robinHood.credentials)
	let robinHoodTweet = 
		robinHoodTwitter
			.tweet(rows.shift()["quote"])
			.then(() => robinHoodTwitter.followRandomPeople())
			.catch((e) => console.trace(e))
			.finally(() => {robinHoodTwitter.close()})
	await robinHoodTweet
	let chickTwitter = new twitter(chick.credentials)
	let chickTweet = 
		chickTwitter
			.tweet(rows.shift()["quote"])
			.then(() => chickTwitter.followRandomPeople())
			.catch((e) => console.trace(e))
			.finally(() => chickTwitter.close())
	await chickTweet
}
if(process.argv[2] == "promo") {
	tweetPromo();
}
else if(process.argv[2] == "quote") {
	tweetQuote();
}