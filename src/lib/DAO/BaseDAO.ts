import Database from "../Database";
export default abstract class BaseDao {
	DB: Database;
	constructor() {
		this.DB = new Database()
	}

	cleanup() {
		this.DB.disconnect();
	}
}