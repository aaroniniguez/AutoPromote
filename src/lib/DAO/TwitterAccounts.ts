/**
 * DAO for stock table
 */
import database from "../Database";
const moment = require('moment-timezone');
class TwitterAccounts {
	username: string;
	DB: any;

	constructor(username?: string) {
		this.DB = new database("localhost", "root", "stock")
		this.username = username;
	}

	async addNewAccount(username: string, password: string, email: string, phone: string) {
		//TODO: temp pass in 1 for owner
		let query = `
			INSERT INTO twitterAccounts (username, password, email, phone, owner)
			VALUES ("${username}", "${password}", "${email}", "${phone}", 1)
		`;
		let result = await this.DB.query(query);
		return result;
	}
	async getNumberFollowing() {
		let query = `SELECT following FROM twitterAccounts where username='${this.username}'`;
		let result = await this.DB.query(query);
		return result[0]["following"];
	}

	async getAccountID() {
		let query = `SELECT id FROM twitterAccounts WHERE username='${this.username}'`;
		let result = await this.DB.query(query);
		return result[0]["id"];
	}

	async updateFollowing(numFollowing: string) {
		await this.DB.query(`UPDATE twitterAccounts set following = '${numFollowing}' WHERE username = '${this.username}'`);
	}
	
	async updateFollowers(numFollowers: string) {
		let accountId = await this.getAccountID();
		var mysqlTimestamp = moment(Date.now()).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss');
		let query = `INSERT INTO followers (userId, time, followers) values('${accountId}','${mysqlTimestamp}','${numFollowers}')`;
		await this.DB.query(query);
	}

	cleanup() {
		this.DB.disconnect();
	}	

}

export default TwitterAccounts;