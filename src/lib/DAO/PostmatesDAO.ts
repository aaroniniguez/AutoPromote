/**
 * DAO for stock table
 */
import database from "../Database";
import Database from "../Database";
import { RowDataPacket } from "mysql";

class PostMatesPromosDAO {
	DB: Database;
	constructor() {
		this.DB = new database("localhost", "root", "stock")
	}

	getRandomTweet() {
		return this.DB.query(`
			SELECT post 
			FROM postmatesPromos
			ORDER BY RAND()
			LIMIT 1
		`).then((row: RowDataPacket[]) => {
			return row[0].post
		});
	}

	cleanup() {
		this.DB.disconnect();
	}
}
export default PostMatesPromosDAO;