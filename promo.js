var twitter = require("./lib/Twitter.js");
const database = require("./lib/Database.js");
let DB =new database("localhost", "root", "stock");
let rawdata = require('fs').readFileSync('/Users/aaroniniguez/NodeProjects/nodeBrowser/secret.json');  
const Defaults  = require("./lib/Defaults.js")
var jesus = new Defaults(JSON.parse(rawdata).TwitterPromo);
var robinHood = new Defaults(JSON.parse(rawdata).RobinHoodPromo);
var chick = new Defaults(JSON.parse(rawdata).chickPromo);
let promotionManager = require("./lib/Promos.js") 
let randomImageTweet = promotionManager.getRandomImagePromotion()
function promote() {
	twitter.postOnTwitter(jesus.credentials, randomImageTweet.message, uploadFile = randomImageTweet.image, randomFollow = true);
	twitter.postOnTwitter(robinHood.credentials, robinHood.message, uploadFile = false, randomFollow = true);
	twitter.postOnTwitter(chick.credentials, chick.message, uploadFile = false, randomFollow = true);
}
function tweetQuote() {
	function handleDBError(error) {
		console.log(error);
		console.log(error.name);
		process.exit();
	}
	DB.query(`
		SELECT *
		FROM stockQuotes
		ORDER BY last_read ASC`)
	.then((rows) => {
		let id = rows[0].id;
		let quote = rows[0].quote;
		DB.query(`
			UPDATE stockQuotes
			SET last_read = now()
			WHERE id = ${id}`);
		twitter.postOnTwitter(jesus.credentials, quote, uploadFile = false, randomFollow = true);
		twitter.postOnTwitter(robinHood.credentials, quote, uploadFile = false, randomFollow = true);
		twitter.postOnTwitter(chick.credentials, quote, uploadFile = false, randomFollow = true);
	})
	.then(()=>{DB.close();})
	.catch(handleDBError)
}
if(process.argv[2] == "promo") {
	promote();
}
else if(process.argv[2] == "quote") {
	tweetQuote();
}
//sudo mysql stop
//kill -9 node