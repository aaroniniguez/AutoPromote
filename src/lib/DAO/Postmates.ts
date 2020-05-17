/**
 * DAO for stock table
 */
import database from "../Database";

class PostMatesPromos {
	DB: any;
	constructor() {
		this.DB = new database("localhost", "root", "stock")
	}

	getPost() {
		return this.DB.query(`
			SELECT post 
			FROM postmatesPromos
			ORDER BY RAND()
			LIMIT 1
		`).then(row => {
			return row[0].post
		});
	}

	cleanup() {
		this.DB.disconnect();
	}
}
export default PostMatesPromos;