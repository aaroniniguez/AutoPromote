require('dotenv').config({ path: '/Users/aaroniniguez/AutoPromote/.env'})

interface DBConfig {
	host: string; 
	user: string;
	database: string;
	password: string;
}
type RowsType = mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[]; 
import mysql, { QueryError, RowDataPacket } from "mysql"
import Connection from "mysql/lib/Connection";
class Database {
	dbConfig: DBConfig;
	connection: Connection;
	constructor(host = "localhost", user = "root", database = "stock") {
		this.dbConfig = {
			host: host,
			user: user,
			database: database,
			password: process.env.DB_PASS
		};

		this.connection = mysql.createConnection(this.dbConfig);
		this.connection.connect(function(err) {
			if (err) {
			  throw console.error('Could not connect to Mysql Server: ' + err.message);
			}
			console.log('Connected to the MySQL server.');
		  });
	}

	handleDisconnect(e: QueryError) {
		if(e.code === "PROTOCOL_CONNECTION_LOST") {
			console.log("Protocol Connection Lost");
		}
		else if(e.code === "ER_DUP_ENTRY") {
			console.log("Duplicate Entries Not Allowed!");
		} else {
			console.log("error: ", e.code)
		}
		this.disconnect();
	}
	
	//this is when you want to stop the connection between your app and the mysql server..so only when your app is stopped...
	disconnect() {
		this.connection.end();
	}

	query(sql: string): Promise<RowsType | void>{
		return new Promise<RowsType>((resolve, reject) => {
			this.connection.query(sql, (err, rows)=> {
				if(err) {
					if(err.code !== "PROTOCOL_CONNECTION_LOST")
						return reject(err);
					//else reconnect
					(async () => {
						setTimeout(() => {
							this.connection = mysql.createConnection(this.dbConfig);
							this.query(sql);
						}, 10000);
					})();
					//return this.query(sql, args);
					//return reject(err);
				};
				// this.disconnect();
				resolve(rows);
			});
		}).catch((e) => {
			//prior...was disconnecting the mysql connection on error...now, just reject ...leave the connection open for reuse
			//return a rejected promise based on what the use case is gonna be...if you chain your queries you want the query to 
			//be rejected so the following queries cant be run...
			if(e.code === "ER_DUP_ENTRY") {
				throw e;
			} else {
				this.handleDisconnect(e);
			}
		});
	}

}

export default Database;