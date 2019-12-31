const database = require("./lib/Database.js");
let DB = new database()
var quote = process.argv[2].trim();
DB.query(`insert into stockQuotes (quote) values("${quote}")`)
    .then(() => DB.query(`select count(*) from stockQuotes`).then(data => console.log(data)))
    .catch((e)=> {
        console.log("Duplicate Entries Not Allowed!");
        //console.log(e);
    })
    .finally(() => DB.close().catch((e)=>{console.log("couldnt close properly");}));