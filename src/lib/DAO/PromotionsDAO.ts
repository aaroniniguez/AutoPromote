import { RowDataPacket } from "mysql";
import readableTimestamp from "../../utils/readable-timestamp";
import BaseDao from "./BaseDAO";

export default class PromotionsDAO extends BaseDao {
	getRandomTweet(promoter: string) {
		return this.DB.query(`
			SELECT *
			FROM promotions
			WHERE promoter = "${promoter}"
			ORDER BY last_read ASC
			LIMIT 1
		`).then((row: RowDataPacket[]) => {
				if(!row.length) throw new Error(`Invalid promotion value: ${promoter}`)
				this.DB.query(`
					UPDATE promotions
					SET last_read = "${readableTimestamp()}"
					WHERE id = ${row[0].id}`
				);
				if(row[0]) {
					row[0].post = row[0].post.replace(/\[referral_link\]/g, row[0].referral_link)
				}
				return row[0]
			});
	}
}