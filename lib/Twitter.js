const puppeteer = require("puppeteer")
class Twitter {
	constructor(credentials) {
		this.credentials = credentials
		this.loggedon = false
		this.typeDelay = {
			delay: 3,
		};
	}
	async guardInit() {
		if(!this.browser)
			this.browser = await puppeteer.launch({headless: false});
		if(!this.page)
			this.page = await this.browser.newPage();
	}
	async goToFollowerPage() {
		await this.guardInit()
		const followPage = "https://twitter.com/who_to_follow";
		await this.page.goto(followPage, {waitUntil: 'networkidle2' });
	}
	/**
	 * Gets all the follow buttons on the page
	 * @returns {Promise} array of ElementHandle's
	 */
	async getAllFollowButtons() {
		await this.guardInit()
		let selector = "//span[text()='Follow']"
		await this.page.waitForXPath(selector);
		let results = await this.page.$x(selector);
		return results
	}
	/**
	 * Follow everyone on follow page, wait 30 seconds then unfollow all
	 */
	async followThenUnfollow() {
		await this.guardInit()
		if(!this.loggedon)
			await this.login()
		await this.goToFollowerPage()
		let followButtons = await this.getAllFollowButtons()
		for(let i =0; i < followButtons.length; i ++) {
			await followButtons[i].click({delay: 500}).catch(function(rejection) {
				console.log("button not clickable", rejection)
			});
		}
		await this.page.waitFor(60000);
		for(let i =0; i < followButtons.length; i ++) {
			await followButtons[i].click({delay: 500}).catch(function(rejection) {
				console.log("button not clickable", rejection)
			});
			await this.page.keyboard.press('Enter')
		}
	}
	async followRandomPeople() {
		await this.guardInit()
		this.goToFollowerPage()
		var selector = "//span[text()='Follow']";
		await this.page.waitForXPath(selector);
		var results = await this.page.$x(selector);
		console.log(results.length);
		for(let i = 0; i < results.length; i++) {
			await results[i].click({delay:500}).catch(function(rejection) {
				console.log("Follow Button not clickable: ", rejection);
			});
		}
	}
	async login() {
		await this.guardInit()
		const twitter = "https://twitter.com/";
		const validLoginPages = [
			"https://twitter.com/home",
			"https://twitter.com/"
		];
		const usernameSelector = "input[name='session[username_or_email]']";
		const passwordSelector = "input.js-password-field"
		await this.page.goto(twitter, { waitUntil: 'networkidle2' });
		//enter sign in
		await this.page.evaluate(() => {
			document.getElementsByClassName("js-nav EdgeButton EdgeButton--medium EdgeButton--secondary StaticLoggedOutHomePage-buttonLogin")[0].click();
		});
		
		await this.page.waitFor(3000);
		let EH = await this.page.waitForSelector(usernameSelector);
		await EH.type(this.credentials.username, this.typeDelay);
		await this.page.type(passwordSelector, this.credentials.password, this.typeDelay);
		await this.page.waitForXPath("//button[text()='Log in']").then((EH)=>EH.click());
		//check if user successfully logged in
		//wait for page to load before getting url
		await this.page.waitFor(3000);
		var url = this.page.url();
		if(!validLoginPages.includes(url)){
			await this.browser.close();
			var errorObject = {
				name: "InvalidCredentials",
				message: "Invalid Credentials"
			}
			throw errorObject;
		}
		else {
			this.loggedon = true
			console.log(url)
		}
	}
	async consoleHandler() {
		await this.guardInit()
		this.page.on('console', (log) => {
			if(log._type == "warning")
				return;
				//console.warn(log._text);	
			else if(log._type == "verbose")
				return;
				//console.debug(log._text);
			else
				console[log._type](log._type+":" + log._text);
		});
	}
	/** Post a tweet on twitter 
	 * - optional image
	 * - optional follow everyone at who_to_follow page
	 * */
	async tweet(data, uploadFile = false) {
		await this.guardInit()
		const twitter = "https://twitter.com/";
		const session = await this.page.target().createCDPSession()
		const {windowId} = await session.send('Browser.getWindowForTarget');
		await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
		if(!this.loggedon)
			await this.login()
		//print out console logging in the page
		await this.consoleHandler();
		await this.page.goto(twitter, { waitUntil: 'networkidle2' });
		await this.page.keyboard.press('KeyN');
		await this.page.waitFor(2000);
		await this.page.keyboard.type(data, this.typeDelay);
		if(uploadFile) {
			const input = await this.page.$('input[type="file"]');
			await input.uploadFile(uploadFile);
			await this.page.waitFor(10000);
		}
		//await this.page.keyboard.down('MetaLeft');
		//await this.page.keyboard.press('Enter');
		//await this.page.keyboard.up('MetaLeft');
		//await this.page.waitFor(9000);
		return;
	};
	async close() {
		await this.browser.close();
	}

}
module.exports = Twitter