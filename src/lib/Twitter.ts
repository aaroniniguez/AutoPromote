const puppeteer = require("puppeteer")
const EditProfile = require("./PageObjects/EditProfile.js");
import {Logger} from "./Logger";
const FollowPage = require("./PageObjects/FollowPage.js");
const LoginPage = require("./PageObjects/LoginPage.js");
import ProfilePage from "./PageObjects/ProfilePage.js";
const MessagesPage = require("./PageObjects/MessagesPage.js");
// const sendMessage = require("./send_sms.js")
import TwitterAccountsDAO from "./DAO/TwitterAccountsDAO";
import { Browser, Page } from "puppeteer";
import PageWrapper from "./PageWrapper";

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
	credentials: any;
	twitterAccountsDAO: TwitterAccountsDAO;
	flowID: string;
	loggedon: boolean;
	typeDelay: {delay: number};
	clickDelay: object;
	navigationParams: any;
	pageWrapper: PageWrapper;
	browser: Browser;

	constructor(username: string, password: string) {
		this.credentials = {
			username,
			password
		}
		this.twitterAccountsDAO = new TwitterAccountsDAO(this.credentials.username);
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
		if(!this.pageWrapper) {
			this.pageWrapper = new PageWrapper(await this.browser.newPage());
			this.pageWrapper.init()
		}
	}

	async updateSuspendedFlag() {
		await this.guardInit();
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		//DONT login the user...can only see suspended status if not logged in
		await this.pageWrapper.page.goto(ProfilePageObject.url, this.navigationParams);
		let result = await this.pageWrapper.page.waitForXPath(ProfilePageObject.isAcccountSuspended, {timeout: 5000})
			.then(() => {
				Logger.log({level: "info", username: ProfilePageObject.url, message: `Account is suspended`, id: this.flowID})
				this.twitterAccountsDAO.setSuspended(this.credentials.username);
			})
			//TODO log this instead of console.log...
			.catch(() => {
				Logger.log({level: "info", username: ProfilePageObject.url, message: `Account is not suspended`, id: this.flowID})
			})
	}

	async sendMessageOnDMRequest() {
		await this.goToPage(MessagesPage.url);
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		Logger.log({level: "info", username: ProfilePageObject.url, message: `Went to dm request url ${MessagesPage.url}`, id: this.flowID})
		let EH = await this.pageWrapper.page.$$(MessagesPage.dmRequests);
		if(EH.length < 1) {
			Logger.log({level: "info", username: ProfilePageObject.url, message: `could not find element with ${MessagesPage.dmRequests} selector`, id: this.flowID})
			return
		}
		let newEH = EH[0]
		await this.pageWrapper.page.evaluate(newEH => {
				return newEH.innerText;
		}, newEH).then((text) => {
				if(!text.includes("don’t have any message")) {
					//add twitter user info to the message
					text = `${this.credentials.username}:\n\n` + text;
					// sendMessage(text);
				}
			});
	}
	/**
	 * 
	 * @param {Object} DB database object
	 */
	async saveFollowingCount() {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.goToPage(ProfilePageObject.url);
		let followingCountSelection = ProfilePageObject.numberFollowing;
		let EH = await this.pageWrapper.findSingleElement(followingCountSelection);
		let text = await this.pageWrapper.page.evaluate(EH => {
				return EH.innerText;
		}, EH).then((text) => {
			return text;
		});
		let numFollowing = parseInt(text.split("Following")[0].replace(",", ""));
		await this.twitterAccountsDAO.updateFollowing(numFollowing);
		Logger.log({level: "info", username: ProfilePageObject.url, message: `Updated number following to ${numFollowing}`, id: this.flowID})
	}
	/**
	 * Saves and overwrites the follower account into the database
	 * @param {Object} DB database object
	 */
	async saveFollowerCount() {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.goToPage(ProfilePageObject.url);
		let followerCountSelection = ProfilePageObject.numberOfFollowers;
		let EH = await this.pageWrapper.findSingleElement(followerCountSelection);
		let text = await this.pageWrapper.page.evaluate(EH => {
				return EH.innerText;
		}, EH).then((text) => {
			return text;
		});
		let numFollowers = parseInt(text.split("Followers")[0].replace(",", ""));
		await this.twitterAccountsDAO.updateFollowers(numFollowers);
		Logger.log({level: "info", username: ProfilePageObject.url, message: `Updated number followers to ${numFollowers}`, id: this.flowID})
	}

	async changeWebsiteTo(url: string) {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.goToPage(ProfilePageObject.url)
		let EH = await this.pageWrapper.findSingleXPathElement(ProfilePageObject.editProfile);
		await EH.click()
		EH = await this.pageWrapper.findSingleElement(ProfilePageObject.editWebsite);
		await EH.click({ clickCount: 3 })
		await EH.type(url)
		EH = await this.pageWrapper.findSingleXPathElement(ProfilePageObject.saveProfileEdits);
		await EH.click()
		await this.pageWrapper.page.waitForNavigation(this.navigationParams)
		return
	}

	/**
	 * Go to a specific twitter page
	 */
	async goToPage(pageGoTo: string) {
		await this.guardInit()
		if(!this.loggedon) {
			await this.login()
		}
		await this.pageWrapper.page.goto(pageGoTo, this.navigationParams);
	}

	async goToPageTest(page: Page, pageGoTo: string) {
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
		await this.pageWrapper.page.waitForXPath(FollowPage.whoToFollow);
		let results = await this.pageWrapper.page.$x(FollowPage.whoToFollow);
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
		if(followButtons.length) await this.pageWrapper.page.waitFor(60000);
		for(let i =0; i < followButtons.length; i ++) {
			await followButtons[i].click(this.clickDelay).catch(function(rejection) {
				console.log("button not clickable", rejection)
			});
			await this.pageWrapper.page.keyboard.press('Enter')
		}
	}

	async canFollow() {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		let followingCount = await this.twitterAccountsDAO.getNumberFollowing()
		Logger.log({level: "info", username: ProfilePageObject.url, message: `Checked if TwitterAccount can follow, has followers: ${followingCount}`, id: this.flowID})
		let isSuspended = await this.twitterAccountsDAO.getSuspended(this.credentials.username);
		if(isSuspended === 1)
			return false
		if(followingCount < 4990)
			return true;
		else 
			return false;
	}
	/**
	 * Follows everyone on who_to_follow page
	 * 	1. does not follow if suspended
	 * 	2. max follow is 5,000
	 */
	async followRandomPeople() {
		if(await this.canFollow() === false)
			return;
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.guardInit()
		await this.goToPage(FollowPage.url);
		await this.pageWrapper.page.waitForXPath(FollowPage.whoToFollow).catch(() => {
			Logger.log({level: "info", username: ProfilePageObject.url, message: `Did not find element ${FollowPage.whoToFollow}`, id: this.flowID})
		});
		var results = await this.pageWrapper.page.$x(FollowPage.whoToFollow);
		for(let i = 0; i < results.length; i++) {
			await results[i].click(this.clickDelay).catch(function(rejection) {
				console.log("Follow Button not clickable: ", rejection);
			});
			await this.pageWrapper.page.waitFor(500)
		}
	}

	async login() {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		try {
			await this.guardInit()
			await this.pageWrapper.page.goto(LoginPage.url, this.navigationParams);
			//await this.page.waitFor(3000);
			let EH = await this.pageWrapper.findSingleElement(LoginPage.username);
			await EH.type(this.credentials.username, this.typeDelay);
			await this.pageWrapper.page.type(LoginPage.password, this.credentials.password, this.typeDelay);
			//await this.page.waitFor(300000);
			await this.pageWrapper.findSingleXPathElement(LoginPage.loginButton).then((EH)=>EH.click());
			//check if user successfully logged in
			//wait for page to load before getting url
			await this.pageWrapper.page.waitFor(3000);
			var url = this.pageWrapper.page.url();
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
			Logger.log({level: "error", username: ProfilePageObject.url, message: e, id: this.flowID})
			throw e;
		}
		Logger.log({level: "info", username: ProfilePageObject.url, message: `Logged in`, id: this.flowID})
	}

	async consoleHandler() {
		await this.guardInit()
		this.pageWrapper.page.on('console', (log) => {
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
	async tweet(data: string, uploadFile?: string) {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		 try {
			await this.guardInit()
			const twitter = "https://twitter.com/compose/tweet";
			if(debugMode) {
				const session = await this.pageWrapper.page.target().createCDPSession()
				const {windowId} = await session.send('Browser.getWindowForTarget') as {windowId: number};
				await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
			}
			if(!this.loggedon)
				await this.login()
			//print out console logging in the page
			//await this.consoleHandler();
			await this.pageWrapper.page.goto(twitter, this.navigationParams);
			// await this.page.waitFor(10000000);
			await this.pageWrapper.page.waitFor(2000);
			await this.pageWrapper.page.keyboard.type(data, this.typeDelay);
			if(uploadFile) {
				console.log(process.cwd());
				Logger.log({level: "info", username: ProfilePageObject.url, message: `Uploading file: ${uploadFile}`, id: this.flowID});
				const input = await this.pageWrapper.findSingleElement("input[type='file']");
				await input.uploadFile(uploadFile);
				await this.pageWrapper.page.waitFor(10000);
			}
			if(debugMode)
				return;
			await this.pageWrapper.page.keyboard.down('MetaLeft');
			await this.pageWrapper.page.keyboard.press('Enter');
			await this.pageWrapper.page.keyboard.up('MetaLeft');
			await this.pageWrapper.page.waitFor(9000);
		}
		catch(e) {
			Logger.log({level: "error", username: ProfilePageObject.url, message: e, id: this.flowID});
		}
		await this.twitterAccountsDAO.updateLastTweeted()
		Logger.log({level: "info", username: ProfilePageObject.url, message: `Tweeted ${data}`, id: this.flowID})
		return;
	};
	
	async close() {
		await this.twitterAccountsDAO.cleanup();
		await this.browser.close();
	}

}
export default Twitter