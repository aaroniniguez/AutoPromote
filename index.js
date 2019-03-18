const puppeteer = require('puppeteer');
const tefs = 'https://mts.tefsec.com/TradenetLogin.aspx';
const twitter = "https://twitter.com/";
const chase = 'https://chase.com';
const util = require('util');
const fs = require('fs');

let rawdata = require('fs').readFileSync('secret.json');  
var tefsCredentials = JSON.parse(rawdata).TEFS; 
var twitterCredentials = JSON.parse(rawdata).Twitter;

async function getTefs() {
  /* Initiate the Puppeteer browser */
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(tefs, { waitUntil: 'networkidle2' });

  /* Run javascript inside of the page */
  let data = await page.evaluate((tefsCredentials) => {
    document.querySelector('input[name="TitansID"]').value = tefsCredentials.username;
    document.querySelector('input[name="Password"]').value = tefsCredentials.password;
	document.querySelector('input[name="Singin"]').click();
	}, tefsCredentials);
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
		return [
			pnl,
			totalEquity
		];
	});
	if(pnl == " Net P&L ") 
	{
		return "Data not available at this time";
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
			"-" : {
				500 : "smh fought the trend",
				300 : "Really could have traded better today :(",
				100 : "small scratch day, will make it back another day",
				0   : "annoying red day"
			},
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
	return message +" :"+ sign + "$" + pnl + " ".repeat(150) + "#Tradenet #tefs #meirbarak";
}
var message = (twitterCredentials.post) ? twitterCredentials.post : "testing!";
getTefs(tefsCredentials).then(data => postOnTwitter(message)).catch(function(error)
{
	console.log(error);	
});
var defaultDelay = 
{
	delay: 30,
};
async function postOnTwitter(data, uploadFile = false) {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto(twitter, { waitUntil: 'networkidle2' });
  //enter sign in
  await page.evaluate(() => {
  		document.getElementsByClassName("js-nav EdgeButton EdgeButton--medium EdgeButton--secondary StaticLoggedOutHomePage-buttonLogin")[0].click();
  });
  await page.waitFor(6000);
  //sign in
  await page.type("input[name='session[username_or_email]']", twitterCredentials.username, defaultDelay);
  await page.type("input.js-password-field", twitterCredentials.password, defaultDelay);
  await page.evaluate(() => {
	if(document.querySelector("button"))
	{
		document.querySelector("button").click();
	}
  });
	await page.waitFor(6000);
  	await page.type("div[name=tweet]", data, defaultDelay);
	if(uploadFile)
	{
		const input = await page.$('input[type="file"]');
		await input.uploadFile(uploadFile);
	}
	await page.waitFor(2000);
	await page.evaluate(() => {
		if(document.querySelectorAll(".tweet-action.EdgeButton.EdgeButton--primary.js-tweet-btn"))
		{
			document.querySelectorAll(".tweet-action.EdgeButton.EdgeButton--primary.js-tweet-btn")[0].click();
		}
	});
	await page.waitFor(2000);
	await browser.close();
	return;
}
