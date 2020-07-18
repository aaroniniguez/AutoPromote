require("dotenv").config();
import twitter from "./lib/Twitter";
import TwitterAccountsDAO from "./lib/DAO/TwitterAccountsDAO";
import PromotionsDAO from "./lib/DAO/PromotionsDAO";

export async function promote(promotion: string) {
	let TwitterAccountDAO = new TwitterAccountsDAO();
	let twitterAccountInfo = await TwitterAccountDAO.getTwitterAccountByType(promotion);
	TwitterAccountDAO.cleanup()
	let promotionsDAO = new PromotionsDAO()
	let promotionInfo = await promotionsDAO.getRandomTweet(promotion);
	promotionsDAO.cleanup()
	let twitterAccount = new twitter(twitterAccountInfo.username, twitterAccountInfo.password)
	twitterAccount
		.tweet(promotionInfo.post, promotionInfo.image)
		.then(() => twitterAccount.update())
		.catch((e) => console.trace(e))
		.finally(() => twitterAccount.close())
}

// testing:
promote(process.argv[2])