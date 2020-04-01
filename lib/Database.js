const mysql = require("mysql")
class Database {

	constructor(host = "localhost", user = "root", database = "stock") {
		this.dbConfig = {
			host: host,
			user: user,
			database: database,
			password: process.env.DB_PASS
		};

		this.connection = mysql.createConnection(this.dbConfig);
	}

	handleDisconnect(e) {
		if(e.code === "PROTOCOL_CONNECTION_LOST") {
			console.log("Protocol Connection Lost");
		}
		else if(e.code === "ER_DUP_ENTRY") {
			console.log("Duplicate Entries Not Allowed!");
		}
		this.disconnect();
	}
	/**
	 * 
	 * @param {String} sql query string
	 * @param {} args 
	 * @returns {Promise} promise value that resolves to result of sql query
	 */

	connect() {
		this.connection = mysql.createConnection(this.dbConfig); 
	}

	disconnect() {
		this.connection.end();
	}

	query(sql, args) {
		this.connect();
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
				this.disconnect();
				resolve(rows);
			});
		}).catch((e) => {
			this.handleDisconnect(e);
		});
	}

}
module.exports = Database