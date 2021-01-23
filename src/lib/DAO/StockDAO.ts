import BaseDao from "./BaseDAO";

export default class StockDAO extends BaseDao {
	async getAllAccountFollowerData() {
		const query = `
			SELECT *
			FROM twitterAccounts
			LEFT JOIN 
			followers on twitterAccounts.id = followers.userId
			ORDER BY twitterAccounts.id, time ASC
		`;
		return await this.DB.query(query)
	}
	async getAccountFollowerData(userID: string) {
		const query =  
		`
			SELECT *
			FROM twitterAccounts
			LEFT JOIN
			followers ON twitterAccounts.id = followers.userId
			WHERE twitterAccounts.id = ${userID}
			ORDER BY time ASC
			LIMIT 10
		`;
		return await this.DB.query(query);
	}


	/**
	 * 
	 * @param {string} quote inserts a quote into the table
	 */
	insert(quote: string) {
		return this.DB.query(`insert into stockQuotes (quote) values("${quote}")`)
			.then(() => {
				return this.DB.query(`select count(*) from stockQuotes`)
			})
			.then((data) => console.log(data))
			.catch(() => {
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
			const ids = row.map((curRow) => curRow.id).join(",");
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