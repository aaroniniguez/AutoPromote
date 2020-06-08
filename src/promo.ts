require("dotenv").config();
import twitter from "./lib/Twitter";
import StockDAO from "./lib/DAO/StockDAO";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import PostMatesPromosDAO from "./lib/DAO/PostmatesDAO";
let TwitterAccountDAO = new TwitterAccountsDAO();
let promotionManager = require("./lib/Promos") 
let randomImagePromo = promotionManager.getRandomImagePromotion()
let randomTextPromo = promotionManager.getRandomTextPromotion()
const debugMode = process.argv[3] === "debug" ? true : false;
if(debugMode) {
	//let DB = new database("localhost", "root", "stock");
	//console.log("hi");
	//(async function () {
	//	let users = await getAllTwitterAccounts();
	//	let testUser = users[1];
	//	console.log(testUser);
	//	let twitterAccount = new twitter(testUser.username, testUser.password);
	//	await twitterAccount.saveFollowerCount(DB);
	//	twitterAccount.close();
	//})();
}
async function setupAccounts() {
	let tasks: Promise<any>[] = [];
	let twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByType("tradenet");
	TwitterAccountDAO.cleanup()
	twitterAccounts.forEach((credentials) => {
		let twitterAccount  = new twitter(credentials.username, credentials.password);
		let actions = twitterAccount
			.changeWebsiteTo("https://tradeforthemoney.com")
			.catch((e: any) => {console.log(e);})
			.finally(() => twitterAccount.close())
		tasks.push(actions);
	});
	await Promise.all(tasks);
}

async function tweetPostmates() {
	let postMatesPromosDAO = new PostMatesPromosDAO()
	let post = await postMatesPromosDAO.getRandomTweet()
	postMatesPromosDAO.cleanup()
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("postmates");
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(post)
		.then(() => twitterAccount.followRandomPeople())
		.then(() => twitterAccount.close())
	TwitterAccountDAO.cleanup()
}

async function tweetPromo() {
	let currentDate = new Date();
	let currentDayValue = currentDate.getDate()
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("tradenet");
	TwitterAccountDAO.cleanup()
	let promotion = currentDayValue %2 ? randomTextPromo : randomImagePromo;
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotion.message, promotion.image)
		.then(() => twitterAccount.saveFollowingCount())
		.then(() => twitterAccount.saveFollowerCount())
		.then(() => twitterAccount.close())
}

async function tweetQuote() {
	//TODO: in future , pass in db object...
	let stockDAO = new StockDAO()
	let twitterAccounts = await TwitterAccountDAO.getTwitterAccountsByType("tradenet");
	let rowsPromise = stockDAO.getQuotes(twitterAccounts.length);
	let rows = await rowsPromise
	TwitterAccountDAO.cleanup();
	stockDAO.cleanup()
	let tasks : Promise<any>[] = [];
	twitterAccounts.forEach(twitterAccount => {
		let accountTwitter = new twitter(twitterAccount.username, twitterAccount.password)
		let accountActions = 
			accountTwitter
				.updateSuspendedFlag()
				.then(() => accountTwitter.tweet(rows.shift()["quote"]))
				.then(() => accountTwitter.sendMessageOnDMRequest())
				.then(() => accountTwitter.saveFollowingCount())
				.then(() => accountTwitter.saveFollowerCount())
				.then(() => accountTwitter.followRandomPeople())
				.catch((e) => console.trace(e))
				.finally(() => accountTwitter.close())
		tasks.push(accountActions)
	});
	await Promise.all(tasks)
}
let adminAction = process.argv[2];
switch(adminAction) {
	case "promo": 
		tweetPromo();
		break;
	case "quote":
		tweetQuote();
		break;
	case "config":
		setupAccounts()
		break;
	case "postmates": 
		tweetPostmates()
		break;
	default: 
		console.log("Invalid Action")
}