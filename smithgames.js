"use strict";

(function (){

	let loggedIn = false;
	let overallUsername = "";

	var running = false;

	var canvas = document.createElement("Canvas");
    var ctx = canvas.getContext("2d");
    var ballRadius = 10;
    var x = canvas.width/2;
    var y = canvas.height-30;
    var dx = 2;
    var dy = -2;
    var paddleHeight = 10;
    var paddleWidth = 75;
    var paddleX = (canvas.width-paddleWidth)/2;
    var rightPressed = false;
    var leftPressed = false;
    var brickRowCount = 10;
    var brickColumnCount = 10;
    var brickWidth = 37;
    var brickHeight = 10;
    var brickPadding = 5;
    var brickOffsetTop = 15;
    var brickOffsetLeft = 15;
    var score = 0;
    var lives = 3;
    var bricks = [];

	window.onload = function(){
		document.getElementById("submit").onclick = logIn;
		document.getElementById("startgame").onclick = gameStart;
		document.getElementById("stopgame").onclick = gameStop;
		


	};	


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

	    for(var c=0; c<brickColumnCount; c++) {
	        bricks[c] = [];
	        for(var r=0; r<brickRowCount; r++) {
	            bricks[c][r] = { x: 0, y: 0, status: 1 };
	        }
    	}

    	running = true;

	    document.addEventListener("keydown", keyDownHandler, false);
	    document.addEventListener("keyup", keyUpHandler, false);

	    y = 300

    	draw();


	}

    function keyDownHandler(e) {
        if(e.keyCode == 39) {
            rightPressed = true;
        }
        else if(e.keyCode == 37) {
            leftPressed = true;
        }
    }
    function keyUpHandler(e) {
        if(e.keyCode == 39) {
            rightPressed = false;
        }
        else if(e.keyCode == 37) {
            leftPressed = false;
        }
    }

    function collisionDetection() {
        for(var c=0; c<brickColumnCount; c++) {
            for(var r=0; r<brickRowCount; r++) {
                var b = bricks[c][r];
                if(b.status == 1) {
                    if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score++;
                        if(score == brickRowCount*brickColumnCount) {
                            alert("YOU WIN, CONGRATS!");
                        }
                    }
                }
            }
        }
    }


    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#3b0000";
        ctx.fill();
        ctx.closePath();
    }
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = "#3b0000";
        ctx.fill();
        ctx.closePath();
    }
    function drawBricks() {
        for(var c=0; c<brickColumnCount; c++) {
            for(var r=0; r<brickRowCount; r++) {
                if(bricks[c][r].status == 1) {
                    var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
                    var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
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
    function drawScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText("Points: "+score, 8, 20);
    }
    function drawLives() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText("Lives: "+lives, canvas.width-65, 20);
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        collisionDetection();
        if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if(y + dy < ballRadius) {
            dy = -dy;
        }
        else if(y + dy > canvas.height-ballRadius) {
            if(x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            }
            else {
                lives--;
                if(!lives) {
                    alert("GAME OVER");
                }
                // player loses a life
                else {
                    x = canvas.width/2;
                    y = canvas.height-30;
                    dx = 5;
                    dy = -5;
                    paddleX = (canvas.width-paddleWidth)/2;
                }
            }
        }
        if(rightPressed && paddleX < canvas.width-paddleWidth) {
            paddleX += 7;
        }
        else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
        x += dx;
        y += dy;

        if (running){
        	requestAnimationFrame(draw);
        }
        
    }



	function gameStop(){
		let gameSpace = document.getElementById("topgame");
		gameSpace.innerHTML = "";
		let gameTitle = document.createElement("h3");
		gameTitle.innerHTML = "Breakout";
		let gameImg = document.createElement("img");
		gameImg.src = "breakimg.png";
		gameImg.alt = "break";
		let description = document.createElement("p");
		description.innerHTML = "Breakout is a game where the user bounces a ball and tries to break all cubes!"
		gameSpace.append(gameTitle);
		gameSpace.append(gameImg);
		gameSpace.append(description);
		document.removeEventListener("keydown", keyDownHandler, false);
		document.removeEventListener("keyup", keyUpHandler, false);
		running = false;
		document.getElementById("startgame").disabled = false;

	}



	function logIn(){
		let username = document.getElementById("username").value;
		let password = document.getElementById("password").value;
		let newuser = document.getElementById("newuser").checked;
		
		let url = "http://nathonbreakout.herokuapp.com:process.env.PORT";

		if (newuser){

			fetch(url)
					.then(checkStatus)
					.then(function(responseText){
							let json = JSON.parse(responseText);
							let users = json["users"];
							let usernames = [];
							let passwords = [];
							// This for loop will add all comments to html page
							for (let i = 0; i < users.length; i++){
								usernames.push(users[i]["username"])
								passwords.push(users[i]["password"])	
							}
							if (usernames.includes(username)){
								document.getElementById("retry").innerHTML = "username taken!";
							} else{
								document.getElementById("retry").innerHTML = "";
								addUser(username, password);
							}
					})
					.catch(function(error){
						console.log(error);
					});

		} else{
			
			fetch(url)
					.then(checkStatus)
					.then(function(responseText){
							let json = JSON.parse(responseText);
							let users = json["users"];
							let usernames = [];
							let passwords = [];
							// This for loop will add all comments to html page
							let found = false;
							for (let i = 0; i < users.length; i++){
								let tempUser = users[i]["username"];
								let tempPass = users[i]["password"];
								if (username == tempUser){
									found = true;
									if (password == tempPass){
										loggedIn = true;
										overallUsername = username;
										document.getElementById("inputs").innerHTML = "User: " + username;
										let button = document.createElement("button");
										button.innerHTML = "log out";
										button.onclick = resetLogin;
										document.getElementById("inputs").innerHTML += "<br>";
										document.getElementById("inputs").appendChild(button);
									} else{
										document.getElementById("retry").innerHTML = "Incorrect Password!";
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


	function addUser(username, password){
		const body = {"username": username,
				"password": password,
				"gamescore": 0};
		const fetchOptions = {
				method : 'POST',
				headers : {
					'Accept': 'application/json',
					'Content-Type' : 'application/json'
		},
		body : JSON.stringify(body)

		};

		let url = "http://nathonbreakout.herokuapp.com:process.env.PORT";
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				console.log(responseText);
				document.getElementById("inputs").innerHTML = "User: " + username;
				loggedIn = true;
				overallUsername = username;
				let button = document.createElement("button");
				button.innerHTML = "log out";
				button.onclick = resetLogin;
				document.getElementById("inputs").innerHTML += "<br>";
				document.getElementById("inputs").appendChild(button);

			})
			.catch(function(error) {
				console.log(error);
			});

	}

	function resetLogin(){
		loggedIn = false;
		overallUsername = "";
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
