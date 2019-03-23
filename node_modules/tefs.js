module.exports = {
	tefs: async function getTefs(username, password) {
		const puppeteer = require('puppeteer');
		const tefs = 'https://mts.tefsec.com/TradenetLogin.aspx';
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
		if(pnl == " Net P&L "){
			await browser.close();
			return;
		}
		else{
			//clean up pnl
			pnl = pnl.replace(/\"/g, "");
			pnl = pnl.replace(/ /g, "");
			var sign = (pnl.includes("(")) ? "-" : "+";
			//negative val
			pnl = pnl.replace(/\(/g, "");
			pnl = pnl.replace(/\)/g, "");
			var messages = {
				"-" : [
					{"amount":500 , "message": ["smh fought the trend"]},
					{"amount":300 , "message": ["Really could have traded better today :("]},
					{"amount":100 , "message": ["small scratch day, will make it back another day"]},
					{"amount":0 , "message": ["pretty much a churning comission day","annoying small red day"]}
				],
				"+" : [
					{"amount":600, "message":["GODDAMN good day, had some good trades, lot of scalp opportunities"]},
					{"amount":300, "message":["im eating good ramen tonight :D"]},
					{"amount":100, "message":["pretty much a scratch day"]},
					{"amount":0, "message":["today was a churning commission day :D!", "small green day, could've definitely traded better, but green is good!"]}
					]
				}
		}
		for (var i=0; i < messages[sign].length; i++)
		{
			if(pnl > messages[sign][i].amount)
			{
				//get random message from message list
				var message = messages[sign][i].message[Math.floor(Math.random()*messages[sign][i].message.length)];
				break;
			}
		}
		await page.screenshot(options);
		await browser.close();
		return message +" :"+ sign + "$" + pnl;
	}
}
