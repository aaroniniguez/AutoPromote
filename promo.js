const twitter = require("twitter");
const database = require("Database");
let DB =new database("localhost", "root", "stock");
let rawdata = require('fs').readFileSync('secret.json');  
var twitterCredentials = JSON.parse(rawdata).Twitter;
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;

var today = new Date();
var hours = ((today.getHours() + 11) % 12 + 1);
var ampm = today.getHours() >= 12 ? "PM" : "AM";
const promote = process.argv[2];
//query db here to get the specific message
if(promote){
	var message = twitterCredentialsPromo.message
}
//twitter.verifyLoginInfo(twitterCredentialsPromo.username, twitterCredentialsPromo.password).catch(function(error)
//{
//	console.log(error);
//});
DB.moveFirstRowToEnd().then(()=>{DB.query("select * from stockQuotes").then((data)=>
	{
		var message = data[0].quote;  
		twitter.postOnTwitter(twitterCredentialsPromo.username, twitterCredentialsPromo.password, message, uploadFile = false, randomFollow = true);
	}
).then(()=>{DB.close();}).catch(function(error){
	console.log(error);
	console.log(error.name);
	process.exit();
})
});