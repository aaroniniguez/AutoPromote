require('dotenv').config({ path: '/Users/aaroniniguez/AutoPromote/.env'})

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
		//test out connection
		this.connection.connect(function(err) {
			if (err) {
			  throw console.error('Could not connect to Mysql Server: ' + err.message);
			}
			console.log('Connected to the MySQL server.');
		  });


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
	
	//this is when you want to stop the connection between your app and the mysql server..so only when your app is stopped...
	disconnect() {
		this.connection.end();
	}

	query(sql, args) {
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
				// this.disconnect();
				resolve(rows);
			});
		}).catch((e) => {
			this.handleDisconnect(e);
		});
	}

}

export default Database;