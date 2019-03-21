
const twitter = require("twitter");
const tefs = require("tefs");
let rawdata = require('fs').readFileSync('secret.json');  
var tefsCredentials = JSON.parse(rawdata).TEFS; 
var twitterCredentials = JSON.parse(rawdata).Twitter;
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;

var today = new Date();
var hours = ((today.getHours() + 11) % 12 + 1);
var ampm = today.getHours() >= 12 ? "PM" : "AM";
var minutes = today.getMinutes();
minutes = minutes < 10 ? "0"+minutes : minutes;
var message = "It's " + hours + ":" + today.getMinutes() + " " + ampm + "!! That means its promotion time :D \n\n";
//twitter.postOnTwitter(twitterCredentialsPromo.username, twitterCredentialsPromo.password, message + twitterCredentialsPromo.post).catch(function(error)
//{
//	console.log(error);
//});
tefs.tefs(tefsCredentials.username, tefsCredentials.password).then(data => twitter.postOnTwitter(twitterCredentials.username, twitterCredentials.password, data, "dailyPNL.png")).catch(function(error){
	console.log(error);
});
