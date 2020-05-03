const express = require("express");
let Stocks = require("../../dist/lib/DAO/Stock").default
let TwitterAccountsDAO = require("../../dist/lib/DAO/TwitterAccounts").default
const router = express.Router();
router.get("/", function(req, res, next) {
    let TwitterAccounts = new TwitterAccountsDAO()
    TwitterAccounts.getAllTwitterAccounts()
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

router.post("/add", async function(req, res, next) {
    //make sure doesnt aleady exist: 

    let newUser = new TwitterAccountsDAO();
    let userExists = await newUser.getTwitterAccount(req.body.username)
        .catch(() => {return res.status(500).json({error: `Database Error`})})
    if(userExists)
        return res.status(401).json({error: "User Already Exists"});
    else
        newUser.addNewAccount(req.body.username, req.body.password, req.body.email, req.body.phone);
    res.send("Success!");
});

module.exports = router;