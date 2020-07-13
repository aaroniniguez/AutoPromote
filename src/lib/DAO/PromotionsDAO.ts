/**
 * DAO for stock table
 */
import Database from "../Database";
import { RowDataPacket } from "mysql";
import readableTimestamp from "../../utils/readable-timestamp";

export default class PromotionsDAO {
	DB: Database;
	constructor() {
		this.DB = new Database("promotions")
	}

	getRandomTweet(promoter: string) {
		return this.DB.query(`
			SELECT *
			FROM promotions
			WHERE promoter = "${promoter}"
			ORDER BY last_read ASC
			LIMIT 1
		`).then((row: RowDataPacket[]) => {
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

	cleanup() {
		this.DB.disconnect();
	}
}