/**
 * DAO for stock table
 */
const database = require("./Database.js");
class Stock {
	constructor() {
		this.DB = new database("localhost", "root", "stock")
	}
	/**
	 * 
	 * @param {string} quote inserts a quote into the table
	 */
	insert(quote) {
		this.DB.query(`insert into stockQuotes (quote) values("${quote}")`)
			.then(() => this.DB.query(`select count(*) from stockQuotes`).then(data => console.log(data)))
			.catch((e)=> {
				console.log("Duplicate Entries Not Allowed!");
			})
			.finally(() => this.DB.close().catch((e)=>{console.log("couldnt close properly");}));
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
	close() {
		return this.DB.close()
	}
}
let stockTable = new Stock()
module.exports = stockTable