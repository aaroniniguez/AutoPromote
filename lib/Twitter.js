const puppeteer = require("puppeteer")
const winston = require("winston");
const {combine, timestamp, prettyPrint} = winston.format;
const logPath = "/Users/aaroniniguez/NodeProjects/nodeBrowser/logs"
const debugMode = process.argv[3] === "debug" ? true : false;
const logger = winston.createLogger({
	level: "info", 
	format: combine(
		timestamp(),
		prettyPrint()
	),
	transports: [
		new winston.transports.File({ filename: logPath+'/error.log', level: 'error' }),
		new winston.transports.File({ filename: logPath+'/combined.log' })
	]
});
class Twitter {
	constructor(credentials) {
		this.credentials = {
			username: credentials.username,
			password: credentials.password
		}
		this.loggedon = false
		this.typeDelay = {
			delay: 3,
		};
		this.navigationParams = {
			waitUntil: [
				"domcontentloaded", //waits till this is fired
				"load", //and this
				"networkidle2" //waits until there are no network events fired off for 500 ms
			]
		}
	}

	async guardInit() {
		if(!this.browser)
			this.browser = await puppeteer.launch({headless: false});
		if(!this.page)
			this.page = await this.browser.newPage();
	}

	async hasMessageRequests() {
		await this.goToPage(`https://twitter.com/messages/requests`);
		let messageSelection = `div[aria-label="Timeline: Message requests"]`;
		let EH = await this.page.$$(messageSelection);
		let newEH = EH[0]
		const text = await this.page.evaluate(newEH => {
				console.log("hmmm")
				return newEH.innerText;
		}, newEH);
		return text;
	}
	async changeWebsiteTo(url) {
		await this.goToPage(`https://twitter.com/${this.credentials.username}`)

		let editProfileSelector = "//span[text()='Edit profile']"
		let websiteSelector = "input[placeholder='Add your website']"
		let saveProfileInfoSelector = "//span[text()='Save']"

		let EH = await this.page.waitForXPath(editProfileSelector);
		await EH.click()
		EH = await this.page.waitForSelector(websiteSelector);
		await EH.click({ clickCount: 3 })
		await EH.type(url)
		EH = await this.page.waitForXPath(saveProfileInfoSelector);
		await EH.click()
		await this.page.waitForNavigation(this.navigationParams)
		return
	}

	/**
	 * Go to a specific twitter page
	 */
	async goToPage(pageGoTo) {
		await this.guardInit()
		if(!this.loggedon) {
			await this.login()
		}
		await this.page.goto(pageGoTo, this.navigationParams);
	}
	async goToFollowerPage() {
		await this.goToPage("https://twitter.com/who_to_follow")
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
		if(followButtons.length) await this.page.waitFor(60000);
		for(let i =0; i < followButtons.length; i ++) {
			await followButtons[i].click({delay: 500}).catch(function(rejection) {
				console.log("button not clickable", rejection)
			});
			await this.page.keyboard.press('Enter')
		}
	}

	/**
	 * Follows everyone on who_to_follow page
	 */
	async followRandomPeople() {
		await this.guardInit()
		await this.goToFollowerPage()
		var selector = "//span[text()='Follow']";
		await this.page.waitForXPath(selector)
		var results = await this.page.$x(selector);
		console.log(this.credentials.username + " following: "+results.length);
		for(let i = 0; i < results.length; i++) {
			await results[i].click({delay:500}).catch(function(rejection) {
				console.log("Follow Button not clickable: ", rejection);
			});
			await this.page.waitFor(500)
		}
	}

	async login() {
		try {
			logger.info(`Logging in ${this.credentials.username}`);
			await this.guardInit()
			const twitter = "https://twitter.com/";
			const validLoginPages = [
				"https://twitter.com/home",
				"https://twitter.com/"
			];
			const usernameSelector = "input[name='session[username_or_email]']";
			const passwordSelector = "input.js-password-field"
			await this.page.goto(twitter, this.navigationParams);
			//enter sign in
			//error here...catch it
			await this.page.evaluate(() => {
				document.getElementsByClassName("js-nav EdgeButton EdgeButton--medium EdgeButton--secondary StaticLoggedOutHomePage-buttonLogin")[0].click();
			});
			await this.page.waitForNavigation(this.navigationParams)
			await this.page.waitFor(3000);
			let EH = await this.page.waitForSelector(usernameSelector);
			await EH.type(this.credentials.username, this.typeDelay);
			await this.page.type(passwordSelector, this.credentials.password, this.typeDelay);
			await this.page.waitForXPath("//button[text()='Log in']").then((EH)=>EH.click());
			//check if user successfully logged in
			//wait for page to load before getting url
			await this.page.waitFor(3000);
			var url = this.page.url();
			if(!validLoginPages.includes(url)) {
				await this.browser.close();
				var errorObject = {
					name: "InvalidCredentials",
					message: `Login went to invalid url: ${url}`
				}
				throw errorObject;
			}
			else {
				this.loggedon = true
			}
		} catch(e) {
			logger.error(e);
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

	/**
	 * 
	 * @param {string} data message to tweet out
	 * @param {string} uploadFile path to image file to be uploaded in the tweet
	 */
	async tweet(data, uploadFile = false) {
		 try {
			await this.guardInit()
			const twitter = "https://twitter.com/";
			if(debugMode) {
				const session = await this.page.target().createCDPSession()
				const {windowId} = await session.send('Browser.getWindowForTarget');
				await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
			}
			if(!this.loggedon)
				await this.login()
			logger.info(`Tweeting ${data}`);
			//print out console logging in the page
			await this.consoleHandler();
			await this.page.goto(twitter, this.navigationParams);
			await this.page.keyboard.press('KeyN');
			await this.page.waitFor(2000);
			await this.page.keyboard.type(data, this.typeDelay);
			if(uploadFile) {
				const input = await this.page.$('input[type="file"]');
				await input.uploadFile(uploadFile);
				await this.page.waitFor(10000);
			}
			if(debugMode)
				return;
			await this.page.keyboard.down('MetaLeft');
			await this.page.keyboard.press('Enter');
			await this.page.keyboard.up('MetaLeft');
			await this.page.waitFor(9000);

		}
		catch(e) {
			logger.error(e)
		}
		return;
	};
	
	async close() {
		await this.browser.close();
	}

}
module.exports = Twitter