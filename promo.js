const twitter = require("twitter");
const database = require("Database");
let DB =new database("localhost", "root", "stock");
let rawdata = require('fs').readFileSync('secret.json');  
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;
var robinHoodCredentialsPromo = JSON.parse(rawdata).RobinHoodPromo;

var today = new Date();
var hours = ((today.getHours() + 11) % 12 + 1);
var ampm = today.getHours() >= 12 ? "PM" : "AM";
const promote = process.argv[2];
//default message:
if(promote == "tradenet"){
	var tradenetMessage = twitterCredentialsPromo.message;
}
else if(promote == "robinhood") {
	var robinHoodMessage = robinHoodCredentialsPromo.message;
}
else if(promote == "promote") {
	var tradenetMessage = twitterCredentialsPromo.message
	var robinHoodMessage = robinHoodCredentialsPromo.message
}

//twitter.verifyLoginInfo(twitterCredentialsPromo.username, twitterCredentialsPromo.password).catch(function(error)
//{
//	console.log(error);
//});
DB.moveFirstRowToEnd().then(()=>{DB.query("select * from stockQuotes order by id").then((data)=>{
	if(typeof robinHoodMessage === 'undefined')
		robinHoodMessage = data[0].quote;
	if(typeof tradenetMessage === 'undefined')
		tradenetMessage = data[0].quote;
	twitter.postOnTwitter(twitterCredentialsPromo.username, twitterCredentialsPromo.password, tradenetMessage, uploadFile = false, randomFollow = true);
	twitter.postOnTwitter(robinHoodCredentialsPromo.username, robinHoodCredentialsPromo.password, robinHoodMessage, uploadFile = false, randomFollow = true);
}).then(()=>{DB.close();}).catch(function(error){
	console.log(error);
	console.log(error.name);
	process.exit();
})
});