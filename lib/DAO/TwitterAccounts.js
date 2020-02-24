/**
 * DAO for stock table
 */
const database = require("../Database.js");
class TwitterAccounts {
	constructor(username) {
		this.DB = new database("localhost", "root", "stock")
		this.username = username;
	}

	async updateFollowing(numFollowing) {
		await this.DB.query(`UPDATE twitterAccounts set following = '${numFollowing}' WHERE username = '${this.username}'`);
	}
	
	async updateFollowers(numFollowers) {
		await this.DB.query(`UPDATE twitterAccounts set followers = '${numFollowers}' WHERE username = '${this.username}'`);
	}
}

module.exports = TwitterAccounts;