require("dotenv").config();
import { TwitterPromoter } from "./lib/Twitter";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import PromotionsDAO from "./lib/DAO/PromotionsDAO";
import { Logger } from "./lib/Logger";

export async function promote(promotion: string) {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByPromotion(promotion);
	TwitterAccountDAO.cleanup()
	let promotionsDAO = new PromotionsDAO()
	let promotionInfo = await promotionsDAO.getRandomTweet(promotion);
	promotionsDAO.cleanup()
	let twitterAccount = new TwitterPromoter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.catch((e) => {
			Logger.log({level: "error", message: "Tweeting failed:"+ e});
		})
		.then(() => twitterAccount.routineActions())
		.finally(() => twitterAccount.close())
}

if(process.argv[2]) {
	promote(process.argv[2]);
}