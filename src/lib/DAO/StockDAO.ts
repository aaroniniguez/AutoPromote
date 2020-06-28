/**
 * DAO for stock table
 */
import database from "../Database";
import { QueryError } from "mysql";
import Database from "../Database";

class StockDAO {
	DB: Database;
	constructor() {
		this.DB = new database("stock")
	}

	async getAllAccountFollowerData() {
		let query = `
			SELECT *
			FROM twitterAccounts
			LEFT JOIN 
			followers on twitterAccounts.id = followers.userId
			ORDER BY twitterAccounts.id, time ASC
		`;
		let result = await this.DB.query(query)
		return result;
	}
	async getAccountFollowerData(userID: string) {
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


	/**
	 * 
	 * @param {string} quote inserts a quote into the table
	 */
	insert(quote: string): Promise<any> {
		return this.DB.query(`insert into stockQuotes (quote) values("${quote}")`)
			.then(() => {
				return this.DB.query(`select count(*) from stockQuotes`)
			})
			.then((data) => console.log(data))
			//TODO what type should the error object be...
			.catch((e: QueryError)=> {
				console.log("Duplicate Entries Not Allowed!");
			});
	}
	getQuotes(number: number) {
		return this.DB.query(`
			SELECT *
			FROM stockQuotes
			ORDER BY last_read ASC
			LIMIT ${number} 
		`).then(row => {
			let ids = row.map((curRow) => curRow.id).join(",");
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

	cleanup() {
		this.DB.disconnect();
	}
}
export default StockDAO