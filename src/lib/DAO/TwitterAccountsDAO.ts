/**
 * DAO for TwitterAccounts table
 */
import database from "../Database";
import {TwitterAccountDBRecord, TwitterAccountRow} from "../interfaces"
const moment = require('moment-timezone');

//put interface for promisereturn type here ....

class TwitterAccountsDAO {
	username: string;
	DB: any;

	constructor(username?: string) {
		this.DB = new database("localhost", "root", "stock")
		this.username = username;
	}
	async getTwitterAccount(username: string) : Promise<TwitterAccountRow>{
		let result = await this.DB.query(`SELECT * FROM twitterAccounts WHERE username="${username}"`);
		return result[0];
	}

	async getAllTwitterAccounts() : Promise<TwitterAccountDBRecord[]> {
		let result = await this.DB.query("SELECT * FROM twitterAccounts");
		return result;
	}

	async getTwitterAccountsByType(promo: string) : Promise<TwitterAccountDBRecord[]> {
		let result = await this.DB.query(`SELECT * FROM twitterAccounts WHERE type="${promo}"`);
		return result;
	}

	async setSuspended(username: string) : Promise<void> {
		let result = await this.DB.query(`UPDATE twitterAccounts SET suspended = true WHERE username='${username}'`)
	}

	async getSuspended(username: string) {
		let result = await this.DB.query(`SELECT suspended FROM twitterAccounts WHERE username='${username}'`) 
		return result[0]["suspended"];
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

	async updateFollowing(numFollowing: number) {
		await this.DB.query(`UPDATE twitterAccounts set following = '${numFollowing}' WHERE username = '${this.username}'`);
	}
	
	async updateFollowers(numFollowers: number) {
		let accountId = await this.getAccountID();
		var mysqlTimestamp = moment(Date.now()).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss');
		let query = `INSERT INTO followers (userId, time, followers) values('${accountId}','${mysqlTimestamp}','${numFollowers}')`;
		await this.DB.query(query);
	}

	cleanup() {
		this.DB.disconnect();
	}	

}

export default TwitterAccountsDAO;