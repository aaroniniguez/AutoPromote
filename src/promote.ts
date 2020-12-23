require("dotenv").config();
import { TwitterPromoter } from "./lib/Twitter";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import PromotionsDAO from "./lib/DAO/PromotionsDAO";

export async function promote(promotion: string, headless = true) {
	const TwitterAccountDAO = new TwitterAccountsDAO();
	const twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByPromotion(promotion);
	TwitterAccountDAO.cleanup()
	const promotionsDAO = new PromotionsDAO()
	const promotionInfo = await promotionsDAO.getRandomTweet(promotion);
	promotionsDAO.cleanup()
	const twitterAccount = new TwitterPromoter(twitterAccountInfo.username, twitterAccountInfo.password, headless)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.catch((e) => {
			// TODO: if this doesnt get reached often , send a text alert.
			twitterAccount.log("error", `Tweeting Failed: ${e}`);
		})
		.then(() => twitterAccount.routineActions())
		.finally(() => twitterAccount.close())
}