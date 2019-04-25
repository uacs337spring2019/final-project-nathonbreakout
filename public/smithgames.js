/***
Nathon Smith
CSc 337
This is the js file for my final web project. This file contains
several functions which allow users to create accounts on the
site and then record their score for the breakout game. The js
code also creates a breakout game. There are several fetches throughout
the code.
*/


// function containing all code
(function (){

	"use strict";

	// module global variables. These are used in several functions.

	// variables that keep track of if a user is logged in and their score
	let loggedIn = false;
	let overallUsername = "";
	let userscore = 0;
	let maxScore = 0;

	// variable that keeps track of if game is being played or not
	let running = false;

	// variables that are used for the playing of the game. A canvas is
	// created along with several x and y variables that are used to
	// determine positioning of the ball and paddle in breakout game.
	let canvas = document.createElement("Canvas");
    let ctx = canvas.getContext("2d");
    let ballRadius = 10;
    let x = canvas.width/2;
    let y = canvas.height-30;

    // speed that ball moves
    let dx = 3;
    let dy = -3;
    let dcount = 3;

    // paddle variables
    let paddleHeight = 10;
    let paddleWidth = 75;
    let paddleX = (canvas.width-paddleWidth)/2;

    // variables showing if user pushing arrow keys
    let rPress = false;
    let lPress = false;

    // variables to build the bricks for breakout game.
    let brickRows = 5;
    let brickCols = 3;
    let brickWidth = 60;
    let brickHeight = 20;
    let brickPadd = 10;
    let brickOffTop = 30;
    let brickOffLeft = 60;

    // variables to hold a score and lives for a game and also the level
    let points = 0;
    let lives = 3;
    let bricks = [];
    let level =1;


    /***
	This function is called when the page completes loading. It assigns four buttons
	functions. The buttons are a log in button, start and stop game buttons, and
	a button that refreshes the score leaderboard.
	*/
	window.onload = function(){
		document.getElementById("submit").onclick = logIn;
		document.getElementById("startgame").onclick = gameStart;
		document.getElementById("stopgame").onclick = gameStop;
		document.getElementById("stopgame").disabled = true;
		document.getElementById("refresh").onclick = updateBoard;
		updateBoard();
	};	

	/***
	This function is called when a user starts a game. It will alter the display
	on the web page by creating and adding element to the page. This
	function is also responsible for creating the bricks, adding event listeners
	to the arrow keys, and resetting game variables as they should be set
	for a game start.
	*/
	function gameStart(){

		let gameSpace = document.getElementById("topgame");
		gameSpace.innerHTML = "";
		let gameTitle = document.createElement("h3");
		gameTitle.innerHTML = "Breakout";
		canvas.width = "480";
		canvas.height = "320";
		let instructions = document.createElement("p");
		instructions.innerHTML = "Use arrow keys to control your paddle!";
		gameSpace.append(gameTitle);
		gameSpace.append(canvas);
		gameSpace.append(instructions);
		document.getElementById("startgame").disabled = true;
		document.getElementById("stopgame").disabled = false;

		// creating all the brick objects which are stored in a 2 d list.
		for(let c=0; c<brickCols; c++) {
			bricks[c] = [];
			for(let r=0; r<brickRows; r++) {
				bricks[c][r] = { x: 0, y: 0, status: 1 };
			}
		}

		running = true;

		// add event listeners to the page.
		document.addEventListener("keydown", keyDownHandler, false);
		document.addEventListener("keyup", keyUpHandler, false);

		// resetting the game variables.
		level = 1;
		rPress = false;
		lPress = false;
		paddleWidth = 75;
		y = 300;
		dcount = 4;
		dx = dcount;
		dy = -dx;

		// calls the draw function which is responsible for updating the canvas.
		draw();
	}

	/***
	This function is called when the user runs out of lives in the breakout game
	or the user presses the stop game button. This function changes reverts the layout
	of the page to before the game was started, resets game statistics, and updates the
	display showing the user score as well as the text file holding all the scores.
	*/
	function gameStop(){

		// updates user score after a game
		if (loggedIn){
			userscore = points;
		}
		lives = 3;
		points = 0;

		//Resetting page layout to before game started.
		let gameSpace = document.getElementById("topgame");
		gameSpace.innerHTML = "";
		let gameTitle = document.createElement("h3");
		gameTitle.innerHTML = "Breakout";
		let gameImg = document.createElement("img");
		gameImg.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT054y4d7kqbe3txi8_-beKdcXWjhvvhxim067vmnpQ-f6V7nLS";
		gameImg.alt = "break";
		let description = document.createElement("p");
		description.innerHTML = "Breakout is a game where the user breaks cubes with a ball!";
		gameSpace.append(gameTitle);
		gameSpace.append(gameImg);
		gameSpace.append(description);

		// removing event listeners from page.
		document.removeEventListener("keydown", keyDownHandler, false);
		document.removeEventListener("keyup", keyUpHandler, false);
		running = false; // game stops running.
		document.getElementById("startgame").disabled = false;
		document.getElementById("stopgame").disabled = true;

		// updates user score and text file holding all scores if a user is logged in.
		if (loggedIn){

			if (userscore > maxScore){
				maxScore = userscore;
			}

			document.getElementById("scorekeeper").innerHTML = "Recent Score: "+userscore + "<br>";
			document.getElementById("scorekeeper").innerHTML += "Best Score: " + maxScore;
			updateScores();
			updateBoard();

		}
	}

	/***
	Small function used to help sort a list numerically.
	@param {number} a first num.
	@param {number} b second num.
	@returns {number} a positive or negative value.
	*/
	function sortNumber(a, b){
		return b-a;
	}

	/***
	This function is called when the game finishes or the user clicks the refresh leaderboard
	button. It will submit a get request that asks for all data from the text file to update
	the leaderboard.
	*/
	function updateBoard(){
		let url = "https://nathon-breakout.herokuapp.com/?mode=board";
		fetch(url)
				.then(checkStatus)
				.then(function(responseText){
						console.log(responseText);
						let json = JSON.parse(responseText);
						let scorelist = json["allscores"]; // list of all scores
						scorelist.sort(sortNumber); // sorts the list
						let leaderscores = document.getElementById("leaderscores");
						// updates the web page html
						leaderscores.innerHTML = scorelist[0] + "<br>" + scorelist[1] +
						"<br>" + scorelist[2];
				})
				.catch(function(error) {
					console.log(error);
				});
	}

	/***
	This function sends a post request to the server to post
	new information regarding the user score
	*/
	function updateScores(){
		const body = {"username": overallUsername, // overallUsername is the users name
				"gamescore": maxScore, // userscore is the score from the previous round
				"what": "update"};
		const fetchOptions = {
				method : 'POST',
				headers : {
					'Accept': 'application/json',
					'Content-Type' : 'application/json'
		},
		body : JSON.stringify(body)

		};

		let url = "https://nathon-breakout.herokuapp.com/";
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				console.log(responseText);		
			})
			.catch(function(error) {
				console.log(error);
			});

	}

	/***
	This function updates r press and lpress.
	rpress: variable determining if right arrow is pressed
	lpress: variable determing if left arrow is pressed
	sets them to true if pressed down.
	@param {event} event is the event
	*/
    function keyDownHandler(event) {
        if(event.keyCode == 39) {
            rPress = true;
        }
        else if(event.keyCode == 37) {
            lPress = true;
        }
    }

    /***
	This function updates r press and lpress.
	rpress: variable determining if right arrow is pressed
	lpress: variable determing if left arrow is pressed
	sets them to false if released
	@param {event} event is the event
	*/
    function keyUpHandler(event) {
		if(event.keyCode == 39) {
			rPress = false;
		}
		else if(event.keyCode == 37) {
			lPress = false;
		}
	}

    /***
	This function determines if there is a collision between a brick and the ball in the game.
	If all bricks are destroyed it will trigger the next level of the game to begin.
	*/
    function detectCollision() {
        for(let c=0; c<brickCols; c++) {
            for(let r=0; r<brickRows; r++) { // looping through 2 d list to check all brick objects
                let b = bricks[c][r];
                if(b.status == 1) { // status refers to if it is alive or not. 1 = alive.
                    if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                        dy = -dy; // ball changes from moving up to moving down.
                        b.status = 0;
                        points++;
                        if(points == (brickRows*brickCols) * level) {
                            nextLevel();
                        }
                    }
                }
            }
        }
    }

    /***
	This functino reloads all the brick objects and sets their status to 1 again.
	It will also speed up the pace of the game making it more difficult.
	*/
	function nextLevel(){
		// reloads all brick objects and sets their status to 1
		for(let c=0; c<brickCols; c++) {
		bricks[c] = [];
		for(let r=0; r<brickRows; r++) {
			bricks[c][r] = { x: 0, y: 0, status: 1 };
		}
		}
		// changes paddle width, level, and speed of ball.
		paddleWidth += 10;
		level += 1;
		x = canvas.width/2;
		y = canvas.height-30;
		dcount += 1; // keeps track of what level the user is one to adjust speed.
		dx = dcount + 1;
		dy = -dx;
		drawBricks();

	}

    /***
	This function draws the ball onto the canvas.
	*/
    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#3b0000";
        ctx.fill();
        ctx.closePath();
    }

    /***
	This function draws the paddle onto the canvas.
	*/
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = "#3b0000";
        ctx.fill();
        ctx.closePath();
    }

    /***
	This function draws all the bricks onto the canvas
	*/
    function drawBricks() {
        for(let c=0; c<brickCols; c++) {
            for(let r=0; r<brickRows; r++) { // loops through 2 d brick list.
                if(bricks[c][r].status == 1) { // if status is 1, brick is drawn.
                    let brickX = (r*(brickWidth+brickPadd))+brickOffLeft;
                    let brickY = (c*(brickHeight+brickPadd))+brickOffTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = "#3b0000";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }


    /***
	This function updates the score on the canvas.
	*/
    function drawPoints() {
        ctx.fillStyle = "#000000";
        ctx.fillText("Points: "+ points, 15, 20);
    }

    /***
	This function updates the lives on the canvas.
	*/
    function drawLives() {
        ctx.fillStyle = "#000000";
        ctx.fillText("Lives: "+ lives, canvas.width-80, 20);
    }

	/***
	This is the main draw function that calls all other functions to update the canvas.
	It is called several times to repeatedly update the canvas.
	*/
    function draw() {

		// clears the canvas then redraws all bricks, balls, paddle, score
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawPoints();
        drawLives();
        detectCollision();

        // changes x direction of ball depending on where it is.
        if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        // changes y direction of ball
        if(y + dy < ballRadius) {
            dy = -dy;
        }
        // another condition changing y direction of ball if it hits top of canvas.
        else if(y + dy > canvas.height-ballRadius) {
            if(x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            }
            else {
                lives--;
                if(!lives) {
                    gameStop();
                }
                // player loses a life
                else {
					// resets the ball position.
                    x = canvas.width/2;
                    y = canvas.height-30;
                    paddleX = (canvas.width-paddleWidth)/2;
                    dx = dcount;
                    dy = -dx;
                }
            }
        }

        // updates the location of the paddle
        if(rPress && paddleX < canvas.width-paddleWidth) {
            paddleX += 7;
        }
        else if(lPress && paddleX > 0) {
            paddleX -= 7;
        }
        // updates location of x and y of ball.
        x += dx;
        y += dy;

        if (running){ // continues to update canvas if game still being played.
			requestAnimationFrame(draw);
        }
        
    }

    /***
	This function contains several fetches to determine if the user already has
	an account and then to log the user in to the website. 
	*/
	function logIn(){
		// username and password are what user types in, newuser is checked if the user
		// is creating a new account. newuser is boolean
		let username = document.getElementById("username").value;
		let password = document.getElementById("password").value;
		let newuser = document.getElementById("newuser").checked;
		

		if (newuser){ // if user making a new account
			let url = "https://nathon-breakout.herokuapp.com/?mode=oneuser";
			fetch(url)
					.then(checkStatus)
					.then(function(responseText){
							let json = JSON.parse(responseText);
							let users = json["users"]; // users = list of curr user objects
							let usernames = []; // array to hold all current usernames.
							let passwords = []; // array to hold all current passwords.
							// This for loop will get all usernames and passwords
							for (let i = 0; i < users.length; i++){
								usernames.push(users[i]["username"]);
								passwords.push(users[i]["password"]);	
							}
							if (usernames.includes(username)){ // cheks if username taken or not
								document.getElementById("retry").innerHTML = "username taken!";
							} else{
								document.getElementById("retry").innerHTML = "";
								addUser(username, password); 
							}
					})
					.catch(function(error){
						console.log(error);
					});

		} else{ // this path taken if user exists and is logging in
			let url = "https://nathon-breakout.herokuapp.com/?mode=oneuser";
			fetch(url)
					.then(checkStatus)
					.then(function(responseText){
							let json = JSON.parse(responseText);
							let users = json["users"]; // users is a list of user objects
							let found = false;
							// loops through users and checks each username and password
							for (let i = 0; i < users.length; i++){
								let tempUser = users[i]["username"];
								let tempPass = users[i]["password"];
								let tempScore = users[i]["gamescore"];
								if (username == tempUser){ // if username is the entered one
									found = true;
									if (password == tempPass){ // if password is correct
										loggedIn = true; // changes logged in status
										maxScore = tempScore;
										overallUsername = username;

										// updates page elements to reflect user information
										document.getElementById("inputs").innerHTML = "User: " +
										username;
										let scores = document.createElement("p");
										scores.innerHTML = "Recent Score: " + userscore + "<br>";
										scores.innerHTML += "Best Score: " + tempScore;
										scores.id = "scorekeeper";
										let button = document.createElement("button");
										button.innerHTML = "log out";
										button.onclick = resetLogin;
										document.getElementById("inputs").innerHTML += "<br>";
										document.getElementById("inputs").appendChild(scores);
										document.getElementById("inputs").appendChild(button);

									} else{
										document.getElementById("retry").innerHTML =
										"Incorrect Password!";
									}
								}	
							}
							if (!found){
								document.getElementById("retry").innerHTML = "Invalid Username!";
							}	
					})
					.catch(function(error){
						console.log(error);
					});

		}

	}

	/***
	This function is called if a new username needs to be added to the text file
	@param {string} username is users username to be added
	@param {string} password is password to be added
	*/
	function addUser(username, password){
		const body = {"username": username,
				"password": password,
				"gamescore": 0,
				"what": "add"};
		const fetchOptions = {
				method : 'POST',
				headers : {
					'Accept': 'application/json',
					'Content-Type' : 'application/json'
		},
		body : JSON.stringify(body)

		};

		let url = "https://nathon-breakout.herokuapp.com/";
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				console.log(responseText);

				// updating page contents to reflect user information
				document.getElementById("inputs").innerHTML = "User: " + username;
				loggedIn = true;
				overallUsername = username;
				let scores = document.createElement("p");
				scores.innerHTML = "Recent Score: " + userscore + "<br>";
				scores.innerHTML += "Best Score: 0";
				scores.id = "scorekeeper";
				let button = document.createElement("button");
				button.innerHTML = "log out";
				button.onclick = resetLogin;
				document.getElementById("inputs").innerHTML += "<br>";
				document.getElementById("inputs").appendChild(scores);
				document.getElementById("inputs").appendChild(button);

			})
			.catch(function(error) {
				console.log(error);
			});

	}

	/***
	This function is called when the users logs out. It resets the status of the page
	and removes all previous user information from the page as well.
	*/
	function resetLogin(){

		// resetting all previous user variables and changing logged in status
		loggedIn = false;
		userscore = 0;
		maxScore = 0;
		overallUsername = "";

		// updating page contents for no user.
		let inputs = document.getElementById("inputs");
		inputs.innerHTML = "New User? <br>(check to make new account)";
		inputs.innerHTML += "<p id=\"retry\"></p><input type=\"checkbox\" id=\"newuser\">";
		inputs.innerHTML += "Username: <input id=\"username\" type=\"text\" name=\"username\">";
		inputs.innerHTML += "Password: <input id=\"password\" type=\"Password\" name=\"password\">";
		inputs.innerHTML += "<br>";
		let button = document.createElement("button");
		button.innerHTML = "Submit";
		button.onclick = logIn;
		inputs.appendChild(button);

	}

	/***
	This function is used to determine if the response from the server is valid or not.
	@param {string} response is response from server
	@returns {string} number to be returned
	*/
	function checkStatus(response){
		if (response.status >= 200 && response.status < 300){
			return response.text();
		} else if(response.status == 404){
			return Promise.reject(new Error("sorry we did not have any data"));
		} else {
			return Promise.reject(new Error(response.status + ": " + response.statusText));
		}
	}



}) ();
