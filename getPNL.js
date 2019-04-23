const twitter = require("twitter");
const facebook = require("facebook");
const tefs = require("tefs");
let rawdata = require('fs').readFileSync('secret.json');  
var tefsCredentials = JSON.parse(rawdata).TEFS; 
var twitterCredentials = JSON.parse(rawdata).Twitter;
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;
var facebookCredentials = JSON.parse(rawdata).Facebook

//console.log(tefs.getWinStreak());
tefs.getTefs(tefsCredentials.username, tefsCredentials.password).then(data => {
	twitter.postOnTwitter(twitterCredentials.username, twitterCredentials.password, data + "\n\n #Tefs #TradeNet #SuretraderKiller", "dailyPNL.png");
	facebook.postOnFacebook(facebookCredentials.username, facebookCredentials.password, data, "dailyPNL.png");
}).catch(function(error){
	console.log(error);	
});