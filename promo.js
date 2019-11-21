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
	jesusTwitter.tweet(randomPromotion.message, uploadFile = randomPromotion.image);
	//twitter.postOnTwitter(robinHood.credentials, robinHood.message, uploadFile = false, randomFollow = true);
	//twitter.postOnTwitter(chick.credentials, chick.message, uploadFile = false, randomFollow = true);
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
					.then(() => privateTwitter.close());
			let jesusTwitter = new twitter(jesus.credentials)
			let jesusTweet = 
				jesusTwitter
					.tweet(quote)
					.then(() => jesusTwitter.followRandomPeople())
					.then(() => jesusTwitter.close());

			let robinHoodTwitter = new twitter(robinHood.credentials)
			let robinHoodTweet = 
				robinHoodTwitter
					.tweet(quote)
					.then(() => robinHoodTwitter.followRandomPeople())
					.then(() => robinHoodTwitter.close());

			let chickTwitter = new twitter(chick.credentials)
			let chickTweet = 
				chickTwitter
					.tweet(quote)
					.then(() => chickTwitter.followRandomPeople())
					.then(() => chickTwitter.close());
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