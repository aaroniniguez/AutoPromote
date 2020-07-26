import readableTimestamp from "../../utils/readable-timestamp";
import BaseDao from "./BaseDAO";

export default class TwitterAccountsDAO extends BaseDao {
	constructor(public username?: string) {
		super()
		this.username = username;
	}

	async getTwitterAccount(username: string) {
		return (await this.DB.query(`SELECT * FROM twitterAccounts WHERE username="${username}"`))[0];
	}

	async getAllTwitterAccounts() {
		return await this.DB.query("SELECT * FROM twitterAccounts");
	}

	async getTwitterAccountsByType(type: string) {
		return await this.DB.query(`SELECT * FROM twitterAccounts WHERE type="${type}" and suspended=0`);
	}

	//TODO: the func above will get deleted soon in a refactor... use this one
	async getTwitterAccountByType(promo: string) {
		return (await this.DB.query(`SELECT * FROM twitterAccounts WHERE type="${promo}" AND suspended=0 ORDER BY last_tweeted ASC`))[0];
	}

	async setSuspended(username: string) : Promise<void> {
		await this.DB.query(`UPDATE twitterAccounts SET suspended = true WHERE username='${username}'`)
	}

	async getSuspended(username: string) : Promise<number>{
		return (await this.DB.query(`SELECT suspended FROM twitterAccounts WHERE username='${username}'`))[0]["suspended"];
	}

	async addNewAccount(username: string, password: string, email: string, phone: string) {
		//TODO: temp pass in 1 for owner
		let query = `
			INSERT INTO twitterAccounts (username, password, email, phone, owner)
			VALUES ("${username}", "${password}", "${email}", "${phone}", 1)
		`;
		return await this.DB.query(query);
	}
	async getNumberFollowing() : Promise<number>{
		return (await this.DB.query(`SELECT following FROM twitterAccounts where username='${this.username}'`))[0]["following"];
	}

	async getAccountID(): Promise<number> {
		return (await this.DB.query(`SELECT id FROM twitterAccounts WHERE username='${this.username}'`))[0]["id"];
	}

	async updateFollowing(numFollowing: number) {
		await this.DB.query(`UPDATE twitterAccounts set following = '${numFollowing}' WHERE username = '${this.username}'`);
	}
	
	async updateFollowers(numFollowers: number) {
		let accountId = await this.getAccountID();
		let query = `INSERT INTO followers (userId, time, followers) values('${accountId}','${readableTimestamp()}','${numFollowers}')`;
		await this.DB.query(query);
	}

	async updateLastTweeted() {
		let query = `UPDATE twitterAccounts SET last_tweeted = "${readableTimestamp()}" WHERE username = "${this.username}";`;
		await this.DB.query(query);
	}
}