
/***
Nathon Smith
CSc 337
This is the javascript server code for my final project. The server
takes get and post requests and with these it modfies a text file
holding all the user information for the website. The server
will use json to send objects creating data back to the js file.
*/
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
app.use(express.static('public'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
               "Origin, X-Requested-With, Content-Type, Accept");
	next();
});



/***
This is the block of code that responds to a get request from
the javascript code. it will read through users.txt and
send back the contents of that file as json. 
*/
app.get('/', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");

	let params = req.query;
	let mode = params.mode;

	let file = fs.readFileSync("users.txt", "utf8");
	let lines = file.split("\n");
	lines.shift();
	let json = {};

	if (mode == "oneuser"){ // if the request is just about one users data
		
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
	} else { // requesting all scores from the server
		let scores = [];
		for (let i = 0; i < lines.length-1; i++){
			let line = lines[i].split("--");
			scores.push(line[2]);
		}
		json["allscores"] = scores;
		res.send(JSON.stringify(json));
	}

	
});

/***
This is the block of code that responds to a post request
from the javascript code. It will append to the users.txt
file with the information the user gives. 
*/
app.post('/', jsonParser, function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let username = req.body.username;
	let gamescore = req.body.gamescore;
	let what = req.body.what;

	if (what == "add"){ // This block of code is if there is a new user being added to the file
		let password = req.body.password;
		let content = "\n" + username + "--" + password + "--" + gamescore; // new line to be added
		fs.appendFile("users.txt", content, function(err) {
		    	if(err) {
					console.log(err);
					res.status(400);
		    	}
		    	console.log("The file was saved!");
		    	res.send("Success!");
			});	

	} else if (what == "update"){ // This is if the game scores are being updated.
		let file = fs.readFileSync("users.txt", "utf8");
		let lines = file.split("\n");
		lines.shift();
		let content = "";
		for (let i = 0; i < lines.length; i++){ // will loop through the entire file and build a string
			let line = lines[i].split("--");
			if (line[0] == username){
				content += "\n" + username + "--" + line[1] + "--" + gamescore;
			} else {
				content += "\n" + line[0] + "--" + line[1] + "--" + line[2];
			}

		}
		// re writing the file with the new data from above.
		fs.writeFile("users.txt", content, function(err) { 
			if(err) {
				console.log(err);
				res.status(400);
		    }
		    res.send("success");
		});
		

	}
	
});

app.listen(process.env.PORT);
