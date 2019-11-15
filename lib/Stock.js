/**
 * DAO for stock table
 */
const database = require("./Database.js");
class Stock {
	constructor() {
		this.DB = new database("localhost", "root", "stock")
	}
	insert(quote) {
		this.DB.query(`insert into stockQuotes (quote) values("${quote}")`)
			.then(() => this.DB.query(`select count(*) from stockQuotes`).then(data => console.log(data)))
			.catch((e)=> {
				console.log("Duplicate Entries Not Allowed!");
			})
			.finally(() => this.DB.close().catch((e)=>{console.log("couldnt close properly");}));
	}
	getAll() {
		return this.DB.query(`
			SELECT *
			FROM stockQuotes
			ORDER BY last_read ASC
		`);
	}
}
let stockTable = new Stock()
module.exports = stockTable