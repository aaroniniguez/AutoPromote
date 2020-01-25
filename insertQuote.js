const database = require("./lib/Database.js");
let DB = new database()
var quote = process.argv[2].trim();
DB.query(`insert into stockQuotes (quote) values("${quote}")`)
    .catch((e)=> {
        console.log("Duplicate Entries Not Allowed!");
	})