const database = require("Database");
DB = new database();
const fs = require("fs");
const assert = require("assert");
//returns valid float pnl
async function cleanupPNL(pnl){
	if(pnl == " Net P&L "){
		return Promise.reject(new Error("Cannot get valid pnl value, must be the weekend"));
	}
	//clean up pnl
	pnl = pnl.replace(/\"/g, "");
	pnl = pnl.replace(/ /g, "");
	var sign = (pnl.includes("(")) ? "-" : "+";
	//negative val
	pnl = pnl.replace(/\(/g, "");
	pnl = pnl.replace(/\)/g, "");
	pnl = pnl.replace(/,/g, "");

	pnl = parseFloat(pnl);
	if(sign == "-")
		pnl = pnl * -1;
	return Promise.resolve(pnl);
}

function getWinStreak(){
	var contents = fs.readFileSync("winStreak.json", "utf8");
	return parseFloat(contents);
}

function setWinStreak(todayPnl){
	var currentStreak = getWinStreak();
	if(todayPnl > 0 && currentStreak > 0){
		currentStreak++;	
	}
	if(todayPnl > 0 && currentStreak < 0){
		currentStreak = 1;
	}
	if(todayPnl < 0 && currentStreak < 0){
		currentStreak--;
	}
	if(todayPnl < 0 && currentStreak > 0){
		currentStreak = -1;
	}
	fs.writeFileSync("winStreak.json", currentStreak, "utf8");
}
function getWinStreakMessage(currentStreak = getWinStreak()){
	if(currentStreak > 0)
		return currentStreak + " green days in a row";
	else
		return currentStreak * -1 + " red days in a row";
}
//return pnl data and save screenshot
async function getTefsPNL(username, password){
	const puppeteer = require('puppeteer');
	const tefs = 'https://mts.tefsec.com/TradenetLogin.aspx';
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	page.setDefaultTimeout(60000);
	await page.goto(tefs, { waitUntil: 'networkidle2' });

	await page.evaluate((username, password) => {
		document.querySelector('input[name="TitansID"]').value = username;
		document.querySelector('input[name="Password"]').value = password;
		document.querySelector('input[name="Singin"]').click();
		}, username, password);
	//successfully logged in
	await page.waitForXPath("//td[contains(text(),'Blotter')]");
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
	//take screenshot
	await page.screenshot(options);
	await browser.close();
	return [pnl, totalEquity];
}

async function getPNLMessage(pnl){
	var pnlMessages = [];
	return await DB.query("select * from stockMessages order by pnl desc").then(rows => {
		var usedPnl;
		rows.forEach(element => {
			if(pnl > element.pnl){
				if(usedPnl != null && usedPnl != element.pnl)
					return
				usedPnl = element.pnl;
				pnlMessages.push(element.message);
			}
		});
		var randomNumber = Math.floor(Math.random()*pnlMessages.length);
		return pnlMessages[randomNumber];
	}).catch((err)=>{
		return Promise.reject(err);
	}).finally(() => {
		DB.close();
	});
}
module.exports = {
	async getTefs(username, password) {
		var [pnl, totalEquity] = await getTefsPNL(username, password);
		pnl = await cleanupPNL(pnl);
		setWinStreak(pnl);
		var message = await getPNLMessage(pnl);
		console.log(getWinStreakMessage())
		var returnMessage = (pnl) ? (message + ": +$"+pnl) : (message + ": -$"+pnl*-1);
		returnMessage += "\nCurrent Streak: "+getWinStreakMessage();
		return returnMessage; 
	}
};

//(async function(){
	//var input = -320;
	////Test: getpnlMessage
	//var actual = await getPNLMessage(input);
	//var expected = "string";
	//assert.deepStrictEqual(typeof actual, expected);

	////Test: negative cleanuppnl
	//input = "(320)";
	//expected = -320;
	//actual = await cleanupPNL(input);
	//assert.deepStrictEqual(actual, expected);
	////Test: positive cleanuppnl
	//input = "322.08";
	//expected = 322.08;
	//actual  = await cleanupPNL(input);
	//assert.deepStrictEqual(actual, expected);
//})().catch((e) => {console.log(e);});