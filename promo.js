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
function tweetQuote() {
	function handleDBError(error) {
		console.log(error);
		process.exit();
	}
	Stocks.getQuote()
		.then(async(quote) => {
			let privateTwitter = new twitter(own.credentials)
				privateTwitter
					.followThenUnfollow()
					.catch((e) => console.trace(e))
					.finally(() => privateTwitter.close())
			let jesusTwitter = new twitter(jesus.credentials)
			let jesusTweet = 
				await jesusTwitter
					.tweet(quote)
					.then(() => jesusTwitter.followRandomPeople())
					.catch((e) => console.trace(e))
					.finally(() => jesusTwitter.close())

			let robinHoodTwitter = new twitter(robinHood.credentials)
			let robinHoodTweet = 
				await robinHoodTwitter
					.tweet(quote)
					.then(() => robinHoodTwitter.followRandomPeople())
					.catch((e) => console.trace(e))
					.finally(() => {robinHoodTwitter.close()})

			let chickTwitter = new twitter(chick.credentials)
			let chickTweet = 
				await chickTwitter
					.tweet(quote)
					.then(() => chickTwitter.followRandomPeople())
					.catch((e) => console.trace(e))
					.finally(() => chickTwitter.close())
			await jesusTweet
			await robinHoodTweet
			await chickTweet
		})
		.then(async() => {
			await Stocks.close();
		})
		.catch(handleDBError);
}
if(process.argv[2] == "promo") {
	tweetPromo();
}
else if(process.argv[2] == "quote") {
	tweetQuote();
}
//sudo mysql stop
//kill -9 node