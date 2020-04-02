const express = require("express");
let Stocks = require("../../dist/lib/DAO/Stock").default
const router = express.Router();
router.get("/", function(req, res, next) {
    Stocks.getAllTwitterAccounts()
        .then((val) => res.send(val))
        .catch((e) => res.status(500).send(`getting all twitter accounts broke!`))
});
router.get("/testing", function(req, res, next) {
    res.send("hi");
})
module.exports = router;