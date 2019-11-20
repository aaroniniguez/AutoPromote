var twitter = require("./lib/Twitter.js");
const database = require("./lib/Database.js");
let DB =new database("localhost", "root", "stock");
let Stocks = require("./lib/Stock.js")
let twitterAccounts = require("./secret.js")
let promotionManager = require("./lib/Promos.js") 
var jesus = twitterAccounts.Jesus;
var robinHood = twitterAccounts.RobinHoodPromo;
var chick = twitterAccounts.chickPromo;
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
		let jesusTwitter = new twitter(jesus.credentials)
		let jesusTweet = jesusTwitter.tweet(quote, uploadFile = false);

		let robinHoodTwitter = new twitter(robinHood.credentials)
		let robinHoodTweet = robinHoodTwitter.tweet(quote, uploadFile = false);

		let chickTwitter = new twitter(chick.credentials)
		let chickTweet = chickTwitter.tweet(quote, uploadFile = false);
		await jesusTweet
		await robinHoodTweet
		await chickTweet
	})
	.then(Stocks.close())
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