import { RowDataPacket } from "mysql";
import readableTimestamp from "../../utils/readable-timestamp";
import BaseDao from "./BaseDAO";

export default class TwitterAccountsDAO extends BaseDao {
	private tableName: string;
	constructor(public username?: string) {
		super()
		this.tableName = 'twitter_accounts';
	}

	async getPromotion() : Promise<string> {
		return (await this.DB.query(`SELECT promotion FROM ${this.tableName} WHERE username="${this.username}"`))[0]["promotion"];
	}

	async wasUpdated() {
		return await this.DB.query(`SELECT count(*) from ${this.tableName} where updated = 1`).then((row: RowDataPacket[]) => !!row[0]['count(*)']);
	}
	
	async resetUpdateFlag() {
		return await this.DB.query(`UPDATE ${this.tableName} set updated = 0`);
	}

	async getTwitterAccount(username: string) {
		const user = await this.DB.query(`SELECT * FROM ${this.tableName} WHERE username="${username}"`);
		if(user) return user[0];
	}

	async getAllTwitterAccounts() {
		return await this.DB.query(`SELECT * FROM ${this.tableName}`);
	}

	async getTwitterAccountsByPromotion(promo: string[]) {
		return await this.DB.query(`SELECT * FROM ${this.tableName} WHERE promotion in ('${promo.join("','")}') and suspended=0`);
	}

	//TODO: the func above will get deleted soon in a refactor... use this one
	async getTwitterAccountByPromotion(promo: string) {
		return (await this.DB.query(`SELECT * FROM ${this.tableName} WHERE promotion="${promo}" AND suspended=0 ORDER BY last_tweeted ASC`))[0];
	}

	async setSuspended(username: string) : Promise<void> {
		await this.DB.query(`UPDATE ${this.tableName} SET suspended = true WHERE username='${username}'`)
	}

	async getSuspended(username: string) : Promise<number>{
		return (await this.DB.query(`SELECT suspended FROM ${this.tableName} WHERE username='${username}'`))[0]["suspended"];
	}

	async addNewAccount(username: string, password: string, email: string, phone: string) {
		//TODO: temp pass in 1 for promotion_id 
		const query = `
			INSERT INTO ${this.tableName} (username, password, email, phone, promotion_id)
			VALUES ("${username}", "${password}", "${email}", "${phone}", 1)
		`;
		return await this.DB.query(query);
	}
	async getNumberFollowing() : Promise<number>{
		return (await this.DB.query(`SELECT following FROM ${this.tableName} where username='${this.username}'`))[0]["following"];
	}

	async getAccountID(): Promise<number> {
		return (await this.DB.query(`SELECT id FROM ${this.tableName} WHERE username='${this.username}'`))[0]["id"];
	}

	async updateFollowing(numFollowing: number) {
		await this.DB.query(`UPDATE ${this.tableName} set following = '${numFollowing}' WHERE username = '${this.username}'`);
	}
	
	async updateFollowers(numFollowers: number) {
		const accountId = await this.getAccountID();
		const query = `INSERT INTO followers (userId, time, followers) values('${accountId}','${readableTimestamp()}','${numFollowers}')`;
		await this.DB.query(query);
	}

	async updateLastTweeted() {
		const query = `UPDATE ${this.tableName} SET last_tweeted = "${readableTimestamp()}" WHERE username = "${this.username}";`;
		await this.DB.query(query);
	}
}