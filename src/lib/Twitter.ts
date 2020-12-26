const puppeteer = require("puppeteer")
import {Logger} from "./Logger";
import FollowPage from "./PageObjects/FollowPage";
import LoginPage from "./PageObjects/LoginPage";
import ProfilePage from "./PageObjects/ProfilePage.js";
import MessagesPage from "./PageObjects/MessagesPage";
import TwitterAccountsDAO from "./DAO/TwitterAccountsDAO";
import { Browser, Page, DirectNavigationOptions } from "puppeteer";
import PageWrapper from "./PageWrapper";
import NotificationsPage from "./PageObjects/NotificationsPage";
import generateUniqueFlowID from "../utils/create-unique-flowID";
import ImageHandler from "./ImageHandler";
import LogoutPage from "./PageObjects/LogoutPage";
import { sendText } from "./sendMessage";

const debugMode = process.argv[3] === "debug" ? true : false;
//const assert = require('assert');
//const pageMock = require("../__mocks__/Page.js")
//let myvar = new pageMock()
//let returnVal = myvar.goto("google.coms");
//returnVal.then((resolved) => {
	//assert.strictEqual(resolved, "google.coms");
//});

export class TwitterPromoter {
	credentials: {username: string, password: string};
	twitterAccountsDAO: TwitterAccountsDAO;
	flowID: string;
	loggedon = false;
	typeDelay: {delay: 3};
	clickDelay: { delay: 500};
	navigationParams: DirectNavigationOptions;
	pageWrapper: PageWrapper;
	browser: Browser;

	constructor(username: string, password: string, private headless = true) {
		this.credentials = {
			username,
			password
		}
		this.twitterAccountsDAO = new TwitterAccountsDAO(this.credentials.username);
		this.flowID = generateUniqueFlowID()
		this.navigationParams = {
			waitUntil: [
				"domcontentloaded",
				"load",
				"networkidle2"
			]
		}
	}

	async guardInit() {
		if(!this.browser)
			this.browser = await puppeteer.launch({headless: this.headless});
		if(!this.pageWrapper) {
			this.pageWrapper = new PageWrapper(await this.browser.newPage());
			this.pageWrapper.init()
		}
	}

	async routineActions() {
		await this.likeAllNotifications()
			.then(() => this.sendMessageOnDMRequest())
			.then(() => this.saveFollowingCount())
			.then(() => this.saveFollowerCount())
			.then(() => this.followRandomPeople())
			.then(() => this.updateSuspendedFlag())
	}
	async updateSuspendedFlag() {
		await this.guardInit();
		// you can only see suspended status if not logged in
		await this.logout()
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		await this.pageWrapper.page.goto(ProfilePageObject.url, this.navigationParams);
		await this.pageWrapper.page.waitForXPath(ProfilePageObject.isAcccountSuspended, {timeout: 50000})
		.then(() => {
			sendText(`Account suspended: username: ${this.credentials.username}`);
			this.log("error", `Account is suspended`)
			this.twitterAccountsDAO.setSuspended(this.credentials.username);
		})
		.catch(() => {
			this.log("info", `Account is not suspended`);
		})
	}

	async likeAllNotifications() {
		await this.guardInit();
		await this.goToPage(NotificationsPage.url);		
		let EH = await this.pageWrapper.page.$$(NotificationsPage.getHearts);
		this.log("info", `Liking ${EH.length} mentions`);
		for(let i =0; i < EH.length; i++) {
			await EH[i].click(this.clickDelay).catch((e) => console.log(e));

		}
	}

	log(level: string, message: string) {
		let ProfilePageObject = new ProfilePage(this.credentials.username);
		Logger.log({level: level, username: ProfilePageObject.url, message: message, id: this.flowID});
	}

	async sendMessageOnDMRequest() {
		await this.goToPage(MessagesPage.url);
		this.log("info", `Went to dm request url ${MessagesPage.url}`);
		let EH = await this.pageWrapper.page.$$(MessagesPage.dmRequests);
		if(EH.length < 1) {
			this.log("info", `could not find element with ${MessagesPage.dmRequests} selector`);
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
		this.log("info", `Updated number following to ${numFollowing}`);
	}
	/**
	 * Saves/updates the follower account in the database
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
		this.log("info", `Updated number of followers to ${numFollowers}`);
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

	async goToPage(pageGoTo: string) {
		await this.guardInit()
		if(!this.loggedon) {
			await this.login()
		}
		await this.pageWrapper.page.goto(pageGoTo, this.navigationParams);
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
		let followingCount = await this.twitterAccountsDAO.getNumberFollowing()
		this.log("info", `Checked if TwitterAccount can follow, is currently following ${followingCount}`);
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
	 * 	2. twitter max allowable follow is 5,000
	 */
	async followRandomPeople() {
		if(await this.canFollow() === false)
			return;
		await this.guardInit()
		await this.goToPage(FollowPage.url);
		await this.pageWrapper.page.waitForXPath(FollowPage.whoToFollow).catch(() => {
			this.log("info", `Did not find element ${FollowPage.whoToFollow}`);
		});
		var results = await this.pageWrapper.page.$x(FollowPage.whoToFollow);
		for(let i = 0; i < results.length; i++) {
			await results[i].click(this.clickDelay).catch(function(rejection) {
				console.log("Follow Button not clickable: ", rejection);
			});
			await this.pageWrapper.page.waitFor(500)
		}
	}

	async logout() {
		await this.pageWrapper.page.goto(LogoutPage.url, this.navigationParams);
		await this.pageWrapper.page.waitFor(2000)
		await this.pageWrapper.page.keyboard.press('Enter')
		await this.pageWrapper.page.waitFor(5000)
		this.loggedon = false;
	}

	async login() {
		try {
			await this.guardInit()
			await this.pageWrapper.page.goto(LoginPage.url, this.navigationParams);
			let EH = await this.pageWrapper.findSingleElement(LoginPage.username);
			await EH.type(this.credentials.username, this.typeDelay);
			await this.pageWrapper.page.type(LoginPage.password, this.credentials.password, this.typeDelay);
			await this.pageWrapper.findSingleXPathElement(LoginPage.loginButton).then((EH)=>EH.click());
			//check if user successfully logged in
			//wait for page to load before getting url
			await this.pageWrapper.page.waitFor(3000);
			var url = this.pageWrapper.page.url();
			if(!LoginPage.validLoginPages.includes(url)) {
				await this.browser.close();
				throw new Error(`Login went to invalid url: ${url}`);
			}
			else {
				this.loggedon = true;
			}
		} catch(e) {
			const logLevel = e.message === "Navigation failed because browser has disconnected!" ? "info" : "error";
			this.log(logLevel, e);
			throw e;
		}
		this.log("info", `Logged in`);
	}

	/**
	 * 
	 * @param {string} data message to tweet out
	 * @param {string} uploadImage path to image file to be uploaded in the tweet
	 */
	async tweet(post: string, uploadImage?: string | null) {
		await this.guardInit()
		const composeTweetUrl = "https://twitter.com/compose/tweet";
		if(debugMode) {
			const session = await this.pageWrapper.page.target().createCDPSession()
			const {windowId} = await session.send('Browser.getWindowForTarget') as {windowId: number};
			await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
		}
		if(!this.loggedon)
			await this.login()
		await this.pageWrapper.page.goto(composeTweetUrl, this.navigationParams);
		await this.pageWrapper.page.waitFor(2000);
		await this.pageWrapper.page.keyboard.type(post, this.typeDelay);
		if(uploadImage) {
			this.log("info", `Uploading file: ${uploadImage}`);
			const filePath = await ImageHandler.saveImage(uploadImage);
			(await this.pageWrapper.findSingleElement("input[type='file']")).uploadFile(filePath);
			await this.pageWrapper.page.waitFor(10000);
			ImageHandler.deleteImage(filePath);
		}
		if(debugMode) {
			await this.twitterAccountsDAO.updateLastTweeted()
			return;
		}
		await this.pageWrapper.page.keyboard.down('MetaLeft');
		await this.pageWrapper.page.keyboard.press('Enter');
		await this.pageWrapper.page.keyboard.up('MetaLeft');
		await this.pageWrapper.page.waitFor(9000);

		if(this.pageWrapper.page.url() === composeTweetUrl) {
			this.log("error", "Tweet Failed To Post");
		}

		await this.twitterAccountsDAO.updateLastTweeted()
		this.log("info", `Tweeted ${post}`);
	};
	
	async close() {
		await this.twitterAccountsDAO.cleanup();
		await this.browser.close();
	}
}