const Stocks = require("./lib/DAO/Stock.js");
var quote = process.argv[2].trim();
Stocks.insert(quote);