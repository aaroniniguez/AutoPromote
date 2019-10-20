var twitter = require("./node_modules/Twitter");
const database = require("Database");
let DB =new database("localhost", "root", "stock");
let rawdata = require('fs').readFileSync('secret.json');  
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;
var robinHoodCredentialsPromo = JSON.parse(rawdata).RobinHoodPromo;

var today = new Date();
var hours = ((today.getHours() + 11) % 12 + 1);
var ampm = today.getHours() >= 12 ? "PM" : "AM";
function promote() {
	twitter.postOnTwitter(twitterCredentialsPromo.username, twitterCredentialsPromo.password, twitterCredentialsPromo.message, uploadFile = false, randomFollow = true);
	twitter.postOnTwitter(robinHoodCredentialsPromo.username, robinHoodCredentialsPromo.password, robinHoodCredentialsPromo.message, uploadFile = false, randomFollow = true);
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
		twitter.postOnTwitter(twitterCredentialsPromo.username, twitterCredentialsPromo.password, quote, uploadFile = false, randomFollow = true);
		twitter.postOnTwitter(robinHoodCredentialsPromo.username, robinHoodCredentialsPromo.password, quote, uploadFile = false, randomFollow = true);
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