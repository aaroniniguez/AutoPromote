var twitter = require("./node_modules/Twitter");
const database = require("Database");
let DB =new database("localhost", "root", "stock");
//var mysql = require("mysql")
//var myNew = mysql.createConnection({
	//host: "localhost",
	//user: "root",
	//database: "stock"
//});
//myNew.connect()
//console.log(myNew);
//process.exit();
let rawdata = require('fs').readFileSync('secret.json');  
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;
var robinHoodCredentialsPromo = JSON.parse(rawdata).RobinHoodPromo;

var today = new Date();
var hours = ((today.getHours() + 11) % 12 + 1);
var ampm = today.getHours() >= 12 ? "PM" : "AM";
//const promote = process.argv[2];
//default message:
//if(promote == "tradenet"){
	//var tradenetMessage = twitterCredentialsPromo.message;
//}
//else if(promote == "robinhood") {
	//var robinHoodMessage = robinHoodCredentialsPromo.message;
//}
//else if(promote == "promote") {
	//var tradenetMessage = twitterCredentialsPromo.message
	//var robinHoodMessage = robinHoodCredentialsPromo.message
//}

//twitter.verifyLoginInfo(twitterCredentialsPromo.username, twitterCredentialsPromo.password).catch(function(error) {
	//console.log(error);
//});
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
	DB.query("select * from stockQuotes order by id")
		.then((rows) => {
			let id = rows[0].id;
			let quote = rows[0].quote;
			DB.query(`delete from stockQuotes where id = ${id}`);
			DB.query(`insert into stockQuotes (quote) values("${quote}")`);
			twitter.postOnTwitter(twitterCredentialsPromo.username, twitterCredentialsPromo.password, quote, uploadFile = false, randomFollow = true);
			twitter.postOnTwitter(robinHoodCredentialsPromo.username, robinHoodCredentialsPromo.password, quote, uploadFile = false, randomFollow = true);
		})
		.then(()=>{DB.close();})
		.catch(handleDBError)
}
tweetQuote();
//promote();

//sudo mysql stop