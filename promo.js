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
	twitter.postOnTwitter(jesus.credentials, randomPromotion.message, uploadFile = randomPromotion.image, randomFollow = true);
	twitter.postOnTwitter(robinHood.credentials, robinHood.message, uploadFile = false, randomFollow = true);
	twitter.postOnTwitter(chick.credentials, chick.message, uploadFile = false, randomFollow = true);
}
function tweetQuote() {
	function handleDBError(error) {
		console.log(error);
		process.exit();
	}
	Stocks.getQuote()
	.then((quote) => {
		twitter.postOnTwitter(jesus.credentials, quote, uploadFile = false, randomFollow = true);
		twitter.postOnTwitter(robinHood.credentials, quote, uploadFile = false, randomFollow = true);
		twitter.postOnTwitter(chick.credentials, quote, uploadFile = false, randomFollow = true);
	})
	.then(()=>{DB.close();})
	.catch(handleDBError)
}
if(process.argv[2] == "promo") {
	tweetPromo();
}
else if(process.argv[2] == "quote") {
	tweetQuote();
}
//sudo mysql stop
//kill -9 node