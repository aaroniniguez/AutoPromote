const database = require("Database");
let DB = new database()
var quote = process.argv[2];
DB.query(`insert into stockQuotes (quote) values("${quote}")`).catch((e)=> {
    console.log("Duplicate Entries Not Allowed!");
    console.log(e);
});
var hmm = DB.query(`select count(*) from stockQuotes`).then(data => console.log(data));
DB.close();