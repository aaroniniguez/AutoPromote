const express = require("express");
let Stocks = require("../../dist/lib/DAO/Stock").default
let TwitterAccounts = require("../../dist/lib/DAO/TwitterAccounts").default
const router = express.Router();
router.get("/", function(req, res, next) {
    Stocks.getAllTwitterAccounts()
        .then((val) => res.send(val))
        .catch((e) => res.status(500).send(`getting all twitter accounts broke!`))
});

router.get("/info", function(req, res, next) {
    res.send("adding");
});

router.get("/followers", function(req, res, next) {
    Stocks.getAllAccountFollowerData()
        .then((val) => {
            let accountsFollowersObject = {};
            val.forEach(element => {
                if(!accountsFollowersObject[element.userId])
                    accountsFollowersObject[element.userId] =  []
                accountsFollowersObject[element.userId].push(element);
            });
            res.send(accountsFollowersObject)
        })
        .catch((e) => res.status(500).send(`testing broke`))
})

router.post("/add", function(req, res, next) {
    console.log(req.body)
    let newUser = new TwitterAccounts();
    newUser.addNewAccount(req.body.username, req.body.password, req.body.email, req.body.phone);
    res.send("Success!");
});

module.exports = router;