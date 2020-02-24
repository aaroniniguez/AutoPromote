const puppeteer = require("puppeteer")
const EditProfile = require("./PageObjects/EditProfile.js");
const logger = require("./Logger.js");
const FollowPage = require("./PageObjects/FollowPage.js");
const LoginPage = require("./PageObjects/LoginPage.js");
const ProfilePage = require("./PageObjects/ProfilePage.js");
const MessagesPage = require("./PageObjects/MessagesPage.js");
const sendMessage = require("./send_sms.js")
let twitterAccountDAO = require("./DAO/TwitterAccounts.js");

var random = require('randomstring');
var generateUniqueFlowID = function(){
    var dt = new Date();
    return random.generate() + dt.toISOString();
}
const debugMode = process.argv[3] === "debug" ? true : false;
const ElementNotFound = require("./ElementNotFound.js")
//const assert = require('assert');
//const pageMock = require("../__mocks__/Page.js")
//let myvar = new pageMock()
//let returnVal = myvar.goto("google.coms");
//returnVal.then((resolved) => {
	//assert.strictEqual(resolved, "google.coms");
//});
class Twitter {
	constructor(username, password) {
		this.credentials = {
			username,
			password
		}
		this.accountDAO = new twitterAccountDAO(this.credentials.username);
		this.flowID = generateUniqueFlowID()
		this.loggedon = false
		this.typeDelay = {
			delay: 3,
		}
		this.clickDelay = {
			delay: 500
		}
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
		if(!this.page) {
			this.page = await this.browser.newPage();
			/**
			 * If element does not exist then throw error
			 */
			this.page.findSingleXPathElement = async function(selector) {
				return await this.waitForXPath(selector).catch((e) => {
					throw new Error(`could not find xpath selector ${selector}`);
				});
			}
			this.page.findSingleElement = async function(selector) {
				await this.waitForSelector(selector);
				let EH = await this.$$(selector);
				if(EH.length === 0) {
					throw new Error(`could not find selector ${selector}`);
				} else {
					return EH[0];
				}
			}
			await this.page.setViewport({width: 1000, height: 1000, isMobile: false});
		}
	}

	async sendMessageOnDMRequest() {
		await this.goToPage(MessagesPage.url);
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		logger.log({level: "info", username: ProfilePageObject.url, message: `Went to dm request url ${MessagesPage.url}`, id: this.flowID})
		let EH = await this.page.$$(MessagesPage.dmRequests);
		if(EH.length < 1) {
			logger.log({level: "info", username: ProfilePageObject.url, message: `could not find element with ${MessagesPage.dmRequests} selector`, id: this.flowID})
			return
		}
		let newEH = EH[0]
		await this.page.evaluate(newEH => {
				return newEH.innerText;
		}, newEH).then((text) => {
				if(!text.includes("don’t have any message")) {
					//add twitter user info to the message
					text = `${this.credentials.username}:\n\n` + text;
					sendMessage(text);
				}
			});
	}

	/**
	 * 
	 * @param {Object} DB database object
	 */
	async saveFollowingCount(DB) {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.goToPage(ProfilePageObject.url);
		let followingCountSelection = ProfilePageObject.numberFollowing;
		let EH = await this.page.findSingleElement(followingCountSelection);
		let text = await this.page.evaluate(EH => {
				return EH.innerText;
		}, EH).then((text) => {
			return text;
		});
		let numFollowing = parseInt(text.split("Following")[0].replace(",", ""));
		await this.accountDAO.updateFollowing(numFollowing);
	}
	/**
	 * Saves and overwrites the follower account into the database
	 * @param {Object} DB database object
	 */
	async saveFollowerCount(DB) {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.goToPage(ProfilePageObject.url);
		let followerCountSelection = ProfilePageObject.numberOfFollowers;
		let EH = await this.page.findSingleElement(followerCountSelection);
		let text = await this.page.evaluate(EH => {
				return EH.innerText;
		}, EH).then((text) => {
			return text;
		});
		let numFollowers = parseInt(text.split("Followers")[0].replace(",", ""));
		await this.accountDAO.updateFollowing(numFollowers);
		logger.log({level: "info", username: ProfilePageObject.url, message: `Updated number followers to ${numFollowers}`, id: this.flowID})
	}

	async changeWebsiteTo(url) {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.goToPage(ProfilePageObject.url)
		let EH = await this.page.findSingleXPathElement(ProfilePageObject.editProfile);
		await EH.click()
		EH = await this.page.findSingleXPathElement(ProfilePageObject.editWebsite);
		await EH.click({ clickCount: 3 })
		await EH.type(url)
		EH = await this.page.findSingleXPathElement(ProfilePageObject.saveProfileEdits);
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

	async goToPageTest(page, pageGoTo) {
		await this.guardInit()
		if(!this.loggedon) {
			await this.login()
		}
		await page.goto(pageGoTo, this.navigationParams);
	}
	/**
	 * Gets all the follow buttons on the page
	 * @returns {Promise} array of ElementHandle's
	 */
	async getAllFollowButtons() {
		await this.guardInit()
		await this.page.waitForXPath(FollowPage.whoToFollow);
		let results = await this.page.$x(FollowPage.whoToFollow);
		return results
	}

	/**
	 * Follow everyone on follow page, wait 30 seconds then unfollow all
	 */
	async followThenUnfollow() {
		await this.guardInit()
		if(!this.loggedon)
			await this.login()
		await this.goToPage(FollowPage.url)
		let followButtons = await this.getAllFollowButtons()
		for(let i =0; i < followButtons.length; i ++) {
			await followButtons[i].click(this.clickDelay).catch(function(rejection) {
				console.log("button not clickable", rejection)
			});
		}
		if(followButtons.length) await this.page.waitFor(60000);
		for(let i =0; i < followButtons.length; i ++) {
			await followButtons[i].click(this.clickDelay).catch(function(rejection) {
				console.log("button not clickable", rejection)
			});
			await this.page.keyboard.press('Enter')
		}
	}

	/**
	 * Follows everyone on who_to_follow page
	 */
	async followRandomPeople() {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.guardInit()
		await this.goToPage(FollowPage.url);
		await this.page.waitForXPath(FollowPage.whoToFollow).catch((e) => {
			logger.log({level: "info", username: ProfilePageObject.url, message: `Did not find elent ${FollowPage.whoToFollow}`, id: this.flowID})
		});
		var results = await this.page.$x(FollowPage.whoToFollow);
		for(let i = 0; i < results.length; i++) {
			await results[i].click(this.clickDelay).catch(function(rejection) {
				console.log("Follow Button not clickable: ", rejection);
			});
			await this.page.waitFor(500)
		}
	}

	async login() {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		try {
			await this.guardInit()
			await this.page.goto(LoginPage.url, this.navigationParams);
			//await this.page.waitFor(3000);
			let EH = await this.page.findSingleElement(LoginPage.username);
			await EH.type(this.credentials.username, this.typeDelay);
			await this.page.type(LoginPage.password, this.credentials.password, this.typeDelay);
			//await this.page.waitFor(300000);
			await this.page.findSingleXPathElement(LoginPage.loginButton).then((EH)=>EH.click());
			//check if user successfully logged in
			//wait for page to load before getting url
			await this.page.waitFor(3000);
			var url = this.page.url();
			if(!LoginPage.validLoginPages.includes(url)) {
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
			logger.log({level: "error", username: ProfilePageObject.url, message: e, id: this.flowID})
			throw e;
		}
		logger.log({level: "info", username: ProfilePageObject.url, message: `Logged in`, id: this.flowID})
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
		let ProfilePageObject = new ProfilePage(this.credentials.username);
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
			//print out console logging in the page
			//await this.consoleHandler();
			await this.page.goto(twitter, this.navigationParams);
			await this.page.keyboard.press('KeyN');
			await this.page.waitFor(2000);
			await this.page.keyboard.type(data, this.typeDelay);
			if(uploadFile) {
				const input = await this.page.findSingleElement("input[type='file']");
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
			logger.log({level: "error", username: ProfilePageObject.url, message: e, id: this.flowID});
		}
		logger.log({level: "info", username: ProfilePageObject.url, message: `Tweeted ${data}`, id: this.flowID})
		return;
	};
	
	async close() {
		await this.browser.close();
	}

}
module.exports = Twitter