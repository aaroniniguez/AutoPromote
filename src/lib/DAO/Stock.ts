/**
 * DAO for stock table
 */
import database from "../Database";

class Stock {
	DB: any;
	constructor() {
		this.DB = new database("localhost", "root", "stock")
	}

	async getAccountFollowerData(userID: string): Promise<JSON> {
		let query =  
		`
			SELECT *
			FROM twitterAccounts
			LEFT JOIN
			followers ON twitterAccounts.id = followers.userId
			WHERE twitterAccounts.id = ${userID}
			ORDER BY time ASC
			LIMIT 10
		`;
		let result = await this.DB.query(query);
		return result;
	}

	async getAllTwitterAccounts() {
		let result = await this.DB.query("SELECT * FROM twitterAccounts");
		return result;
	}
	/**
	 * 
	 * @param {string} quote inserts a quote into the table
	 */
	insert(quote: string) {
		this.DB.query(`insert into stockQuotes (quote) values("${quote}")`)
			.then(() => this.DB.query(`select count(*) from stockQuotes`).then(data => console.log(data)))
			.catch((e)=> {
				console.log("Duplicate Entries Not Allowed!");
			});
	}
	getQuotes(number: string) {
		return this.DB.query(`
			SELECT *
			FROM stockQuotes
			ORDER BY last_read ASC
			LIMIT ${number} 
		`).then(row => {
			let ids = row.map((curRow) => curRow.id);
			ids = ids.join(",")
			this.DB.query(`
				UPDATE stockQuotes
				SET last_read = now()
				WHERE id in (${ids})`
			);
			return row
		});
	}
	/**
	 * returns a quote ordered by oldest read 
	 */
	getQuote() {
		return this.DB.query(`
			SELECT *
			FROM stockQuotes
			ORDER BY last_read ASC
			LIMIT 1
		`).then(row => {
			this.DB.query(`
				UPDATE stockQuotes
				SET last_read = now()
				WHERE id = ${row[0].id}`
			);
			return row[0].quote
		});
	}
}
export default new Stock()