/**
 * DAO for stock table
 */
const database = require("../Database.js");
const moment = require('moment-timezone');
class TwitterAccounts {
	constructor(username) {
		this.DB = new database("localhost", "root", "stock")
		this.username = username;
	}

	async getAccountID() {
		let query = `SELECT id FROM twitterAccounts WHERE username='${this.username}'`;
		let result = await this.DB.query(query);
		return result[0]["id"];
	}

	async updateFollowing(numFollowing) {
		await this.DB.query(`UPDATE twitterAccounts set following = '${numFollowing}' WHERE username = '${this.username}'`);
	}
	
	async updateFollowers(numFollowers) {
		let accountId = await this.getAccountID();
		var mysqlTimestamp = moment(Date.now()).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss');
		let query = `INSERT INTO followers (userId, time, followers) values('${accountId}','${mysqlTimestamp}','${numFollowers}')`;
		await this.DB.query(query);
	}
}

module.exports = TwitterAccounts;