const twitter = require("twitter");
const tefs = require("tefs");
let rawdata = require('fs').readFileSync('secret.json');  
var tefsCredentials = JSON.parse(rawdata).TEFS; 
var twitterCredentials = JSON.parse(rawdata).Twitter;
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;

tefs.tefs(tefsCredentials.username, tefsCredentials.password).then(data => twitter.postOnTwitter(twitterCredentials.username, twitterCredentials.password, data, "dailyPNL.png")).catch(function(error){
	console.log(error);
});
