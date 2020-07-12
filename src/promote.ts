require("dotenv").config();
import twitter from "./lib/Twitter";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import PromotionsDAO from "./lib/DAO/PromotionsDAO";

async function tweetAirbnb() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("airbnb");
	TwitterAccountDAO.cleanup()
	let promotionsDAO = new PromotionsDAO()
	let promotionInfo = await promotionsDAO.getRandomTweet("airbnb");
	await promotionsDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => {
			twitterAccount.close();
		})
}
async function tweetPostmates() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let promotionsDAO = new PromotionsDAO()
	let promotionInfo = await promotionsDAO.getRandomTweet("postmates");
	await promotionsDAO.cleanup()
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("postmates");
	TwitterAccountDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => {
			twitterAccount.close();
		})
}

async function tweetTradenet() {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType("tradenet");
	TwitterAccountDAO.cleanup()
	let promotionsDAO = new PromotionsDAO()
	let promotionInfo = await promotionsDAO.getRandomTweet("tradenet");
	promotionsDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => twitterAccount.close())
}

export function promote(promotion: string) {
	switch(promotion) {
		case "airbnb":
			tweetAirbnb()
			break;
		case "tradenet": 
			tweetTradenet();
			break;
		case "postmates": 
			tweetPostmates()
			break;
		default:
			console.log("Invalid Promotion")
	}
}