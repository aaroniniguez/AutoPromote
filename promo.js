const twitter = require("twitter");
let rawdata = require('fs').readFileSync('secret.json');  
var twitterCredentials = JSON.parse(rawdata).Twitter;
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;

var today = new Date();
var hours = ((today.getHours() + 11) % 12 + 1);
var ampm = today.getHours() >= 12 ? "PM" : "AM";
var minutes = today.getMinutes();
minutes = minutes < 10 ? "0"+minutes : minutes;
var message = "It's " + hours + ":" + today.getMinutes() + " " + ampm + "!! That means its promotion time :D \n\n";
//twitter.verifyLoginInfo(twitterCredentialsPromo.username, twitterCredentialsPromo.password).catch(function(error)
//{
//	console.log(error);
//});
twitter.postOnTwitter(twitterCredentialsPromo.username, twitterCredentialsPromo.password, message + twitterCredentialsPromo.post, uploadFile = false, randomFollow = false).catch(function(error){
	console.log(error);
	console.log(error.name);
	process.exit();
});
