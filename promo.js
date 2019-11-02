var twitter = require("./Twitter");
const database = require("./Database");
let DB =new database("localhost", "root", "stock");
let rawdata = require('fs').readFileSync('/Users/aaroniniguez/NodeProjects/nodeBrowser/secret.json');  
var jesusCredentialsPromo = JSON.parse(rawdata).TwitterPromo;
let jesusCredentials = {
	"username":jesusCredentialsPromo.username,
	"password":jesusCredentialsPromo.password
}
var robinHoodCredentialsPromo = JSON.parse(rawdata).RobinHoodPromo;
let robinHoodCredentials = {
	"username":robinHoodCredentialsPromo.username,
	"password":robinHoodCredentialsPromo.password
}
var chickCredentialsPromo = JSON.parse(rawdata).chickPromo;
let chickCredentials = {
	"username": chickCredentialsPromo.username,
	"password": chickCredentialsPromo.password
}

var today = new Date();
var hours = ((today.getHours() + 11) % 12 + 1);
var ampm = today.getHours() >= 12 ? "PM" : "AM";
function promote() {
	twitter.postOnTwitter(jesusCredentials, jesusCredentialsPromo.message, uploadFile = false, randomFollow = true);
	twitter.postOnTwitter(robinHoodCredentials, robinHoodCredentialsPromo.message, uploadFile = false, randomFollow = true);
	twitter.postOnTwitter(chickCredentials, chickCredentialsPromo.message, uploadFile = false, randomFollow = true);
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
		twitter.postOnTwitter(jesusCredentials, quote, uploadFile = false, randomFollow = true);
		twitter.postOnTwitter(robinHoodCredentials, quote, uploadFile = false, randomFollow = true);
		twitter.postOnTwitter(chickCredentials, quote, uploadFile = false, randomFollow = true);
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