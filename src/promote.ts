import dotenv from 'dotenv';
dotenv.config();
import { TwitterPromoter } from "./lib/Twitter";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import PromotionsDAO from "./lib/DAO/PromotionsDAO";
import { sendText } from "./lib/sendMessage";

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
			twitterAccount.log("error", `Tweeting Failed: ${e}`);
			sendText(`Tweeting Failed: username: ${twitterAccountInfo.username}`);
		})
		.then(() => twitterAccount.routineActions())
		.catch((e) => console.trace(e))
		.finally(() => twitterAccount.close())
}