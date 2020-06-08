const Stocks = require("./dist/lib/DAO/StockDAO.js").default;
let Stock = new Stocks()
var quote = process.argv[2].trim();
Stock
    .insert(quote)
    .then(() => Stock.cleanup());