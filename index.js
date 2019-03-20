const puppeteer = require('puppeteer');
const tefs = 'https://mts.tefsec.com/TradenetLogin.aspx';

const twitter = require("./twitter");
let rawdata = require('fs').readFileSync('secret.json');  
var tefsCredentials = JSON.parse(rawdata).TEFS; 
var twitterCredentials = JSON.parse(rawdata).Twitter;
var twitterCredentialsPromo = JSON.parse(rawdata).TwitterPromo;

async function getTefs(username, password) {
  /* Initiate the Puppeteer browser */
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(tefs, { waitUntil: 'networkidle2' });

  /* Run javascript inside of the page */
	await page.evaluate((username, password) => {
		document.querySelector('input[name="TitansID"]').value = username;
		document.querySelector('input[name="Password"]').value = password;
		document.querySelector('input[name="Singin"]').click();
		}, username, password);
	await page.waitFor(6000);
	var options = 
	{
		path: "dailyPNL.png",
		fullPage: false,
		clip:
		{
			x: 0,
			y: 400,
			width:1100,
			height:200
		}
	};
	let [pnl, totalEquity] = await page.evaluate(() => {
		var countRows = document.querySelectorAll("table.boxContentText")[6].querySelectorAll("td:last-child").length
		var pnl = document.querySelectorAll("table.boxContentText")[6].querySelectorAll("td:last-child")[countRows-1].textContent
		var totalEquity = document.querySelectorAll("table.boxContentText")[4].querySelectorAll("td:last-child")[5].textContent
		return [pnl, totalEquity];
	});
	if(pnl == " Net P&L ") 
	{
		await browser.close();
		return;
	}
	else
	{
		//clean up pnl
		pnl = pnl.replace(/\"/g, "");
		pnl = pnl.replace(/ /g, "");
		var sign = (pnl.includes("(")) ? "-" : "+";
		//negative val
		pnl = pnl.replace(/\(/g, "");
		pnl = pnl.replace(/\)/g, "");
		var messages = {
			"-" : [
				{"amount":500 , "message": "smh fought the trend"},
				{"amount":300 , "message": "Really could have traded better today :("},
				{"amount":100 , "message": "small scratch day, will make it back another day"},
				{"amount":0 , "message": "annoying small red day"}
			],
			"+" : [
				{"amount":600, "message":"GODDAMN good day, had some good trades, lot of scalp opportunities"},
				{"amount":300, "message":"im eating good ramen tonight :D"},
				{"amount":100, "message":"pretty much a scratch day"},
				{"amount":0, "message":"churning commission :D!"}
				]
			}
	}
	for (var i=0; i < messages[sign].length; i++)
	{
		if(pnl > messages[sign][i].amount)
		{
			var message = messages[sign][i].message;
			break;
		}
	}
	await page.screenshot(options);
	await browser.close();
	return message +" :"+ sign + "$" + pnl + "\n\n" + "#Tradenet #tefs #meirbarak";
}
var today = new Date();
var message = "It's " + today.getHours() + ":" + today.getMinutes() + "!! That means its promotion time :D \n\n";
//twitter.postOnTwitter(twitterCredentialsPromo.username, twitterCredentialsPromo.password, message + twitterCredentialsPromo.post).catch(function(error)
//{
//	console.log(error);
//});
getTefs(tefsCredentials.username, tefsCredentials.password).then(data => twitter.postOnTwitter(twitterCredentials.username, twitterCredentials.password, data, "dailyPNL.png")).catch(function(error)
{
	console.log(error);
});
