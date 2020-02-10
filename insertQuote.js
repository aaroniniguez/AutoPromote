const Stocks = require("./lib/DB/Stock.js");
var quote = process.argv[2].trim();
Stocks.insert(quote);