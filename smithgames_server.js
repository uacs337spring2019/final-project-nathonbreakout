

"use strict";

/***
This is the block of code that has all the required
things we need to run our node service. It is mainly copied
from the slides.
*/
const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
               "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
app.use(express.static('public'));


/***
This is the block of code that responds to a get request from
the javascript code. it will read through users.txt and
send back the contents of that file as json. 
*/
app.get('/', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let file = fs.readFileSync("users.txt", "utf8");
	let lines = file.split("\n");
	let json = {}
	let users = [];
	for (let i = 0; i < lines.length; i++){
		let user = {};
		let line = lines[i].split("--");
		user["username"] = line[0];
		user["password"] = line[1];
		user["gamescore"] = line[2];
		users.push(user);
	}
	json["users"] = users;
	res.send(JSON.stringify(json));
})

/***
This is the block of code that responds to a post request
from the javascript code. It will append to the users.txt
file with the information the user gives. 
*/
app.post('/', jsonParser, function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let username = req.body.username;
	let password = req.body.password;
	let gamescore = req.body.gamescore;
	console.log(username, password, gamescore);
	let content = "\n" + username + "--" + password + "--" + gamescore;

	fs.appendFile("users.txt", content, function(err) {
	    	if(err) {
				console.log(err);
				res.status(400);
	    	}
	    	console.log("The file was saved!");
	    	res.send("Success!");
		});	
})

app.listen(3000);