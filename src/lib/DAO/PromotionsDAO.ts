/**
 * DAO for stock table
 */
import database from "../Database";
import Database from "../Database";
import { RowDataPacket } from "mysql";

class PromotionsDAO {
	DB: Database;
	constructor() {
		this.DB = new database("localhost", "root", "promotions")
	}

	getRandomTweet(promoter: string) {
		return this.DB.query(`
			SELECT * 
			FROM promotions
			WHERE promoter = "${promoter}"
			ORDER BY RAND()
			LIMIT 1
		`).then((row: RowDataPacket[]) => {
			return row[0]
		});
	}

	cleanup() {
		this.DB.disconnect();
	}
}
export default PromotionsDAO;