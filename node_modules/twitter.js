module.exports = {
	async verifyLoginInfo(username, password)
	{
		const validLoginPages = {"https://twitter.com/home":"new", "https://twitter.com/":"old"};
		const puppeteer = require('puppeteer');
		const twitter = "https://twitter.com/";
		const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  		//const browser = await puppeteer.launch({headless: false});
		const page = await browser.newPage();
		page.setDefaultTimeout(60000);
		page.on('console', (log) => 
		{
			if(log._type == "warning")
				return;
				//console["warn"](log._text);	
			else if(log._type == "verbose")
				console["debug"](log._text);
			else
				console[log._type](log._text);
		});
		await page.goto(twitter, { waitUntil: 'networkidle2' });
		//enter sign in
		await page.evaluate(() => {
			document.getElementsByClassName("js-nav EdgeButton EdgeButton--medium EdgeButton--secondary StaticLoggedOutHomePage-buttonLogin")[0].click();
		});
		await page.waitForSelector("input.js-password-field");
		//sign in
		//sometimes typeing is too fast and the text gets cutoff...
		await page.waitFor(2000);
		await page.type("input[name='session[username_or_email]']", username);
		await page.type("input.js-password-field", password);
		await page.evaluate(() => {
			var submitButton = document.querySelector("button");
			if(submitButton){
				submitButton.click()
			}
		});
		await page.waitFor(3000);
		var url = page.url();
		console.log("Logged in to: "+url);
		if(!Object.keys(validLoginPages).includes(url)){
			var errorObject = {
				name: "InvalidCredentials",
				message: "Invalid Credentials"
			}
			await browser.close();
			throw errorObject;
		}
		else{
			var twitterVersion = validLoginPages[url];
		}
		await browser.close();
		return true;
	},
	postOnTwitter: async function postOnTwitter(username, password, data, uploadFile = false, randomFollow = false) {
		const validLoginPages = {"https://twitter.com/home":"new", "https://twitter.com/":"old"};
		var defaultDelay = {
			delay: 30,
		};
		const puppeteer = require('puppeteer');
		const twitter = "https://twitter.com/";
		//const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  		const browser = await puppeteer.launch({headless: false});
		const page = await browser.newPage();
		//print out console logging in the page
		page.on('console', (log) => 
		{
			if(log._type == "warning")
				return;
				//console["warn"](log._text);	
			else if(log._type == "verbose")
				console["debug"](log._text);
			else
				console[log._type](log._text);
		});
		await page.goto(twitter, { waitUntil: 'networkidle2' });
		//enter sign in
		await page.evaluate(() => {
			document.getElementsByClassName("js-nav EdgeButton EdgeButton--medium EdgeButton--secondary StaticLoggedOutHomePage-buttonLogin")[0].click();
		});
		
		//sign in
		await page.waitFor(3000);
		await page.type("input[name='session[username_or_email]']", username, defaultDelay);
		await page.type("input.js-password-field", password, defaultDelay);
		await page.evaluate(() => {
			var submitButton = document.querySelector("button");
			if(submitButton){
				submitButton.click()
			}
		});
		//check if user successfully logged in
		//wait for page to load before getting url
		await page.waitFor(3000);
		var url = page.url();
		console.log("Logged in to: "+url);
		if(!Object.keys(validLoginPages).includes(url)){
			var errorObject = {
				name: "InvalidCredentials",
				message: "Invalid Credentials"
			}
			await browser.close();
			throw errorObject;
		}
		else{
			var twitterVersion = validLoginPages[url];
		}
		console.log("Twitter Version: "+twitterVersion);
		//cant use this anymore since twitter changed their ui...now just assume logged in ok
		if(randomFollow)
		{
			const followPage = "https://twitter.com/"+username+"/followers";
			await page.goto(followPage, {waitUntil: 'networkidle2' });
			var suggestedFollowersLength = await page.evaluate(() => {
				var suggestedFollowers = document.getElementsByClassName("user-actions-follow-button js-follow-btn follow-button");
				suggestedFollowersLength  = suggestedFollowers.length;
				if(suggestedFollowers.length < 10){
					return suggestedFollowersLength; 
				}
				else{
					document.getElementsByClassName("user-actions-follow-button js-follow-btn follow-button")[0].click();
				}
			});
			console.log("Suggested Followers:"+suggestedFollowersLength);
			if(suggestedFollowersLength < 10)
			{
				const whoToFollow = "https://twitter.com/who_to_follow/suggestions";
				await page.goto(whoToFollow, {waitUntil: 'networkidle2' });
				await page.evaluate(() => {
					document.getElementsByClassName("user-actions-follow-button js-follow-btn follow-button")[0].click();
				});
			}
			await page.waitFor(3000);
			await page.goto(twitter, { waitUntil: 'networkidle2' });
		}
		if(twitterVersion == "old"){
			await page.type("div[name=tweet]", data, defaultDelay);
		}
		else{
			await page.keyboard.press('KeyN');
			await page.waitFor(2000);
			await page.keyboard.type(data, defaultDelay);
		}
		if(uploadFile){
			const input = await page.$('input[type="file"]');
			await input.uploadFile(uploadFile);
			await page.waitFor(10000);
		}
		await page.keyboard.down('MetaLeft');
		await page.keyboard.press('Enter');
		await page.keyboard.up('MetaLeft');

		await page.waitFor(2000);
		if(twitterVersion == "old"){
			await page.waitForSelector("button.new-tweets-bar");
		} else {
			await page.waitFor(9000);
			//TODO: do check for new version else tweet was not sent, most likely duplicated
		}
		await browser.close();
		return;
	},
};