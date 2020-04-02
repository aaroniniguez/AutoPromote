const express = require("express");
let Stocks = require("../../dist/lib/DAO/Stock").default
const router = express.Router();
router.get("/", function(req, res, next) {
    Stocks.getAllTwitterAccounts()
        .then((val) => res.send(val))
        .catch((e) => res.status(500).send(`getting all twitter accounts broke!`))
});

router.get("/info", function(req, res, next) {
    res.send("adding");
});
router.get("/:accountID", function(req, res, next) {
    Stocks.getAccountFollowerData(req.params.accountID)
        .then((val) => res.send(val))
        .catch((e) => res.status(500).send(`testing broke`))
})
module.exports = router;