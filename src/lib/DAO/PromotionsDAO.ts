/**
 * DAO for stock table
 */
import database from "../Database";
import Database from "../Database";
import { RowDataPacket } from "mysql";
import readableTimestamp from "../../utils/readable-timestamp";

export default class PromotionsDAO {
	DB: Database;
	constructor() {
		this.DB = new database("promotions")
	}

	getRandomTweet(promoter: string) {
		return this.DB.query(`
			SELECT id, post, image 
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
				return row[0]
			});
	}

	cleanup() {
		this.DB.disconnect();
	}
}