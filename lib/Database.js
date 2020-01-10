const mysql = require("mysql")
class Database {
	constructor(host = "localhost", user = "root", database = "stock"){
		this.dbConfig = {
			host: host,
			user: user,
			database: database
		};
		this.connection = mysql.createConnection(this.dbConfig);
	}
	handleDisconnect(e) {
		if(e.code === "PROTOCOL_CONNECTION_LOST") {
			this.connection = mysql.createConnection(this.dbConfig);
		}
		else
			throw e;
	}
	/**
	 * 
	 * @param {String} sql query string
	 * @param {} args 
	 * @returns {Promise} promise value that resolves to result of sql query
	 */
	query(sql, args){
		return new Promise((resolve, reject) => {
			this.connection.query(sql, args, (err, rows)=> {
				if(err) {
					if(err.code !== "PROTOCOL_CONNECTION_LOST")
						return reject(err);
					//else reconnect
					(async () => {
						setTimeout(() => {
							this.connection = mysql.createConnection(this.dbConfig);
							this.query(sql, args);
						}, 10000);
					})();
					//return this.query(sql, args);
					//return reject(err);
				};
				resolve(rows);
			});
		}).catch((e) => {
			this.handleDisconnect(e);
		});
	}

	close() {
		return new Promise((resolve, reject) => {
			this.connection.end( err => {
				if(err) return reject(err)
				resolve();
			});
		});
	}
}
module.exports = Database