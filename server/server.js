require('dotenv').config()
const express = require('express'); 
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const os = require('os');
var util = require('util');
var cors = require('cors')
const accountRoutes = require("./routes/accounts");
var log_file = fs.createWriteStream(__dirname + '/serverLog.txt', {flags : 'a'});
console.log = function(...args){
	var myTime = new Date();
	myTime = myTime.toString().split("GMT")[0];
	log_file.write("\n====" + myTime + "====\n");
	args.forEach(function(element){
	   log_file.write(util.format(element) + '\n');
	});
};
var bodyParser = require('body-parser');

//catches all errors, use this wrapper on all app.get callback func
const asyncHandler = fn =>  
    (req, res, next) =>  {
        Promise.resolve(fn(req, res, next)).catch(function(error){   
			console.log(error);
			if(error.name == "InvalidInput" || error.name == "InvalidCredentials"){
				res.send(`{"type":"error","message":"${error.message}"}`);
				res.end();
				return;
			}else{
				console.log(error);
			}
            next();
        });
    };  
	
//Define app
let app = express();
app.use(cors());
app.response.savedSend = app.response.send;
app.response.send = function(data){
	console.log("RESPONSE "+ data);	
	return this.savedSend(data);
};

app.use(bodyParser.urlencoded({
	 extended: true 
}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
	res.type("json");
	if(isEmptyObject(req.body))
		console.log(req.method +" "+ req.url);
	else
		console.log(req.method +" "+ req.url, req.body);
	next();
});

//Request Endpoint
app.get('/test.php', asyncHandler(async function(req, res) {
	//Get Zone id
	res.send(`{"live":"success"}`);
	res.end();
	return;
}));
app.use("/accounts", accountRoutes);
function validateString(input, message){
	if(typeof input === "undefined" || !input)
		throw {name: "InvalidInput", message: message};
}
function getNumberText(number, type) {
	var originalNumber = number;
	if(type == "minute" && originalNumber == "1")
		return "1st "+type;
	if(originalNumber == "1")
		return type;
	number = number.substring(number.length-1);
	switch (number) {
		case "0":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			return originalNumber+"th "+type;
		case "1":
			return originalNumber+"st "+type;
		case "2":
			return originalNumber+"nd "+type;
		case "3":
			return originalNumber+"rd "+type;
		default:
			return originalNumber +" "+ type;
	}
}
function getCronMessage(days, hours, minutes) {
	var message = "Tweeting on the 1st minute of every "+ getNumberText(hours, "hour") + " on every " + getNumberText(days, "day") + " on the " + getNumberText(minutes, "minute");
	console.log(message);
	return message;
}
//db query to get a users scheduled tweets
async function getTweets(username) {
	var query = `select * from tweets where username = "${username}"`;
	return database.query(query).finally(()=>{database.close();});
}
async function validateUsername(username, password){
	var query = `select * from tweets where username = "${username}"`;	
	var result = await database.query(query).finally(()=>{database.close();});
	var validUsername = true;
	result.forEach((element)=>{
		if(element.password != password)
			validUsername = false;
	});
	return validUsername;
}
async function deleteTweet(id) {
	var query = `delete from tweets where id = ${id}`;
	return database.query(query).finally(()=>{database.close();});
}
function isEmptyObject(obj) {
	  return !Object.keys(obj).length;
}
//convert each scheduled tweet to its json equivalent
function convertTweetToJson(rowObject){
	var response = "[";
	rowObject.forEach(element => {
		element.tweet = element.tweet.replace(/\n/g,"\\n");
		element.tweet = element.tweet.replace(/\r/g,"\\r");
		element.tweet = element.tweet.replace(/\t/g,"\\t");
		//element.tweet = element.tweet.replace("\n", "\\n");
		response += `{"id":"${element.id}","hours":"${element.hours}", "days":"${element.days}", "minutes":"${element.minutes}", "tweet":"${element.tweet}"},`;
	});
	if(response != "[")
		response = response.replace(/.$/, "");
	response += "]";
	return response;
}
app.post(["/deleteTweet.php", "/api/v1/deleteTweet.php"], asyncHandler(async function(req, res) {
	var id = req.body.id;
	if(typeof id === "undefined"){
		res.send(`{"type":"error","message": "Invalid Request"}`);
		res.end();
		return;
	}
	var usersTweets = await deleteTweet(id);
	res.send(`{"type":"success","message": "Deleted Tweet!"}`);
	res.end();
}));
app.post("/getTweets.php", asyncHandler(async function(req, res) {
	var username = req.body.username;
	if(typeof username === "undefined"){
		res.send(`{"type":"error","message": "Invalid Request"}`);
		res.end();
		return;
	}
	var usersTweets = await getTweets(username);
	var allTweets = convertTweetToJson(usersTweets);
	//write json response for each row in response..
	res.send(`{"requests":${allTweets}}`);
	res.end();
}));
app.post("/api/v1/getTweets.php", asyncHandler(async function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if(typeof username === "undefined" || typeof password === "undefined"){
		res.send(`{"type":"error","message": "Invalid Request"}`);
		res.end();
		return;
	}
	var validUsername = await validateUsername(username, password);
	if(!validUsername){
		res.send(`{"type":"error","message": "Invalid Username and Password Combination."}`);
		res.end();
		return;
	}
	var usersTweets = await getTweets(username);
	var allTweets = convertTweetToJson(usersTweets);
	//write json response for each row in response..
	res.send(`{"requests":${allTweets}}`);
	res.end();
}));
app.post(['/tweet.php', '/api/v1/tweet.php'], asyncHandler(async function(req, res) {
	var password = req.body.password;
	var username = req.body.username;
	var tweet = req.body.tweet;
	var days = req.body.days;
	var hours = req.body.hours;
	var minutes = req.body.minutes;
	validateString(password, "Please set Password");
	validateString(username, "Please set Username");
	validateString(tweet, "Please set a tweet!");
	validateString(days, "Please set a days value!");
	validateString(hours, "Please set an hours value!");
	validateString(minutes, "Please set a minutes value!");
	//dont need this anymore(now that we dont use cron):
	//tweet = tweet.replace(/'/g,"\\'");
	//tweet = tweet.replace(/%/g, "\\%");
	//tweet = tweet.replace(/\n/g, "\\n");
	//verify the users data
	await twitter.verifyLoginInfo(username, password).catch(function(error){
	if(error.name == "TimeoutError"){
		throw {name: "InvalidCredentials", message: "Invalid Credentials!"};
	}
	else{
		console.log(error.message);
		throw error;	
	}
	});
	database.query(`insert into tweets (username, password, tweet, days, hours, minutes) values("${username}", "${password}", "${tweet}", ${days}, ${hours}, ${minutes})`).then(()=>{
		var message = getCronMessage(days, hours, minutes);
		res.send(`{"type":"success","message": "${message}"}`);
		res.end();
	}).catch( err => {
		console.log(err);
		res.send(`{"type":"Error","message": "Database Error!"}`);
		res.end();
	}).finally(()=>{
		database.close();
	});
}));

let server = app.listen(process.env.PORT)
	.on("close", message => console.log("close", message))
	.on("connection", message => console.log("connection", message))
	.on("error", error => console.log("error", error))
	.on("listening", error => console.log(`listening at http://localhost:${process.env.PORT}`, error))