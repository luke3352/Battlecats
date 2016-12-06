//app.js
var express = require('express');
var app = express();
var path = require('path');
var serv = require('http').Server(app);
var mysql = require("mysql");

// All HTML files
app.get('/', function(req, res) { res.sendFile(path.join(__dirname + '/client/index.html')); });
app.get('/login', function(req, res) { res.sendFile(path.join(__dirname + '/client/login/login.html')); });
app.get('/createAccount', function(req, res){ res.sendFile(path.join(__dirname + '/client/create-account/createAccount.html')); });
app.get('/mainMenu', function(req, res) { res.sendFile(path.join(__dirname + '/client/main-menu/mainMenu.html')); });
app.get('/createRoom', function(req, res) { res.sendFile(path.join(__dirname + '/client/create-room/createRoom.html')); });
app.get('/joinRoom', function(req, res) { res.sendFile(path.join(__dirname + '/client/join-room/joinRoom.html')); });
app.get('/hostRoom', function(req, res) { res.sendFile(path.join(__dirname + '/client/host-room/hostRoom.html')); });
app.get('/characterSelect', function(req, res) { res.sendFile(path.join(__dirname + '/client/character-select/characterSelect.html')); });
app.get('/weaponSelect', function(req, res) { res.sendFile(path.join(__dirname + '/client/weapon-select/weaponSelect.html')); });
app.get('/game', function(req, res) { res.sendFile(path.join(__dirname + '/client/game/game.html')); });
app.get('/startPage', function(req, res) { res.sendFile(path.join(__dirname + '/client/start-page/startPage.html'));});
app.get('/endGame', function(req, res) { res.sendFile(path.join(__dirname + '/client/end-game/endGame.html'));});
app.use('/client', express.static(__dirname + '/client'));

var User = 	require("./controllers/user.js");
var Room = require("./controllers/room.js");
var Player = require("./controllers/player.js");
var Entity = require("./controllers/entity.js");
var Weapon = require("./controllers/weapon.js");
var Projectile = require("./controllers/projectile.js");
var Obstacles = require("./controllers/obstacles.js");
var Items = require("./controllers/items.js");

var pause = false;
var numPlayer = 0;

serv.listen(2000);
console.log("Server started.");

//DATABASE FUNCTIONS FOR LOGIN
var verifypassword = verifypassword;
var check_account = check_account;
var add_account = add_account; 
var getRoomsList = getRoomsList;
var getRoomObject = getRoomObject;
var deleteRoom = deleteRoom;
var addRoom = addRoom;
var startGame = startGame;


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
	var id = socket.id;
	var currentRoom;
	socket.on('disconnect', function() {
		console.log("DISCONNECT");
		if(currentRoom){
			console.log(socket.id," is disconnecting from ", currentRoom);
			socket.leave(currentRoom);
		}
		if(Player.PLAYER_LIST[id]) delete Player.PLAYER_LIST[id];
	});
    
	///////////////////////////
	// GENERIC JOINING ROOMS //
	///////////////////////////
	socket.on('joinRoom', function(data){
		console.log("joining room: ", data);
		socket.join(data);
		currentRoom = data;
	});
	socket.on('leaveRoom', function(data){
		console.log("leaving room: ", data);
		socket.leave(data);
	});
	
	////////////////////////////
	// DATABASE AND ROOMSLIST //
	////////////////////////////
    socket.on('getRoomsListFromDatabase', function(){
    	console.log("recieved emit");
    	getRoomsList(function(roomslist){
    		returnRoomsList(roomslist);
    	});
    });
    
    function returnRoomsList(roomslist){
    	socket.emit("updateRoomsList", JSON.parse(roomslist));
    }
    function returnRoomsListAll(roomslist){
    	socket.to('JoinRoom').emit("updateRoomsList", JSON.parse(roomslist));
    }
   
    socket.on('addRoomToDatabase', function(data){
    	roomId = data.id + "";
    	roomObject = JSON.stringify(data);
    	addRoom(roomId, roomObject);
    });
    socket.on('deleteRoomFromDatabase', function(data){
    	console.log(data);
        deleteRoom(data);
    });
 
    socket.on('getRoomObjectFromDatabase', function(roomID){
    	//console.log(roomID);
    	getRoomObject((roomID + ""), function(roomobject){
    		returnRoomObject(roomobject);
    	});
    });
    function returnRoomObject(roomobject){
    	socket.emit("retrieveRoomConfig", JSON.parse(JSON.parse(roomobject)[0].Room_Object));
    } 	

    
    ////////////////
    // START GAME //
    ////////////////
    socket.on('startGame', function(id, user, gameConfig, catImage, weaponImage,itemImage){
    	console.log("startGame catImage: ", catImage);
    	startGame(id, user, gameConfig, catImage, weaponImage, itemImage, socket);
    });

	///////////////////////
	// HOST ROOM SOCKETS //
	///////////////////////
	socket.on('sendCreateRoomData',function(data, user){
        var room = Room.room(data);
        room.roomPlayers.push(user);     
    	getRoomsList(function(roomslist){
    		returnRoomsListAll(roomslist);
    	});
    });	
	socket.on('hostRoomConnection', function(id, user){
		io.to(id).emit('addToHostRoomChat', user + ': has connected.');
	});
    socket.on('sendHostRoomMsgToServer',function(user, msg, id){
        io.to(id).emit('addToHostRoomChat', user + ': ' + msg);
    });	 

    
    ///////////////////////
	// JOIN ROOM SOCKETS //
    ///////////////////////
	socket.on('joinRoomConnection', function(user){
		io.to('JoinRoom').emit('addToJoinRoomChat', user + ': has connected.');
	});
	// HANDLES JOINROOM MESSAGES
    socket.on('sendJoinRoomMsgToServer',function(user, msg){
        io.to('JoinRoom').emit('addToJoinRoomChat', user + ': ' + msg);
    });	 

	///////////////////
	// LOGIN SOCKETS //
    ///////////////////
	socket.on('sendLoginData',function(data){
		 var username = data.username;
	     var password = data.password;
	     verifypassword(username, password, function(correct, experience, wins){
	    	 console.log("experience: " + experience);
	    	 console.log("wins: " + wins);
	      	 sendCorrectPassword(username, password, correct, experience, wins);
	    });  
    });	
	
	function sendCorrectPassword(username, password, correct, experience, wins) {
		console.log(correct);
		var correct = correct;
		var password = password;
		var experience = experience;
		var wins = wins;
		var sendpasswordverification = {correct: correct, username: username, password: password, experience: experience, wins: wins};
		socket.emit('sendpasswordverification', sendpasswordverification);

	}
	
	//CREATE ACCOUNT
	socket.on('sendNewAccountData', function(data){
		var username = data.newusername;
		var password = data.newpassword;
		check_account(username, password, function(value){
			verifycreateAccount(value, username, password);
		});
	})
	
	function verifycreateAccount(value, username, password){
		var value = value; 
		console.log(value);
		if (value === 1){
			add_account(username, password);
		}
		var verifiednewaccount = {value: value};
		socket.emit('verifiednewaccount', verifiednewaccount);
	}

});

function verifypassword(username, password, callback){
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
	});

	connection.connect();
	connection.query("SELECT * from User_Info WHERE username ="+ "'" + username+ "'" +";", function(err, rows, fields) {
		if (!err){
			var string = JSON.stringify(rows);
			var json = JSON.parse(string);
			var correct;
			var experience; 
			var wins;
			if (JSON.stringify(rows) === "[]"){
				console.log("username was not in database... create new account");
				correct = 0;
			}
			else{
				var correctpassword = json[0]._password;
				console.log("entered password: " + password);
				console.log("correct password: " + correctpassword)
				if (password === correctpassword){
					console.log(true);
					console.log('correct password set');
					correct = 1; 
					experience = json[0].experience;
					wins = json[0].wins;
					console.log(experience);
					console.log(wins);
				}
				else{
					console.log(false);
					console.log('incorrect password set');
					correct = 2;
				}
			}
			console.log('return callback');
			return callback(correct, experience, wins);
		}
	});
	console.log('end the connection')
	connection.end();
}
//VERIFIES NEW ACCOUNT DOESN'T PREVIOUS EXIST AND
//PASSWORD FITS ALL THREE REQUIREMENTS
function check_account(username, password, callback){
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
	});
	console.log(username);
	connection.connect();
	connection.query("SELECT * from User_Info WHERE username ="+ "'" + username+ "'" +";", function(err, rows, fields) {
		if (!err){
			console.log(JSON.stringify(rows));
			if (JSON.stringify(rows) === "[]"){
				console.log("putting into query");
				if (username === ""){
					value = 3;
				}
				//password verification, regexp wrong
				else if (!(password.match(RegExp(/^.{6,}$/)) && (password.match(RegExp(/[0-9]/))) &&  (password.match(RegExp(/[A-Z]/))))){
					value = 2;
				}
				else{
					value = 1;
				}
				console.log(value);
			}
			else{
				console.log("username is already in database");
				value = 0;
			}
			return callback(value);
		}
	});
	console.log("end connection");
	connection.end();
}
//ADD NEW ACCOUNT TO DATABASE
function add_account(username, password){
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
	});
	console.log(username);
	connection.connect();
	var userinfo = [username,password, '0', '0']
	connection.query("INSERT INTO User_Info SET username = ?, _password = ?, experience = ?, wins = ?", userinfo, function(err, result) {
	});
	console.log("end connection");
	connection.end();
}
//GETS ROOMS LIST FROM DATABASE
var getRoomsList = function(callback){
	
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
	});
	
	connection.connect();
	connection.query("SELECT * from Rooms", function(err, rows, fields) {
		if (!err){
			var roomslist = JSON.stringify(rows);
//			if (JSON.stringify(rows) === "[]"){
//				//this means that there is nothing in the room tables
//			}
			//console.log(roomslist);
			return callback(roomslist);
		}
	});
	console.log('end the connection');
	connection.end();
};
//GETS SPECIFIC ROOM OBJECT FROM DATABASE GIVEN THE ID
var getRoomObject = function(RoomId, callback){
	
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
	});
	
	connection.connect();
	connection.query("SELECT Room_Object from Rooms WHERE Room_Id ="+ "'" + RoomId + "'" +";", function(err, rows, fields) {
		if (!err){
			var roomobject = JSON.stringify(rows);
//			if (JSON.stringify(rows) === "[]"){
//				//this means that there isn't a room with that ID
//			}
			//console.log(roomobject);
			return callback(roomobject);
		}
	});
	console.log('end the connection');
	connection.end();
};
//DELETE ROOM FROM DATABASE
var deleteRoom = function(roomId){
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
	});
	connection.connect();
	var roominfo = [roomId]
	connection.query(" DELETE FROM Rooms WHERE Room_Id = ?", roominfo, function(err, result) {
	});
	connection.end();
}
//ADD ROOM TO DATABASE
var addRoom = function(roomId, roomObject){
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
	});
	connection.connect();
	var roominfo = [roomId,roomObject];
	
	connection.query("INSERT INTO Rooms SET Room_Id = ?, Room_Object = ?", roominfo, function(err, result) {
	});
	connection.end();
}

//GET NUMBER OF WINS FOR A PLAYER
function getWins(winner, callback) {
	var connection = mysql.createConnection({
		host : 'mysql.cs.iastate.edu',
		user : 'dbu309la07',
		password : '5rqZthHkdvd',
		database : 'db309la07'
	});
	connection.connect();
	console.log("username: " + winner);
	connection.query("SELECT * FROM User_Info WHERE username = ?", winner,
			function(err, result) {
				var string = JSON.stringify(result);
				var json = JSON.parse(string);
				console.log(json);
				var numberOfWins = json[0].wins;
				console.log("numberOfWins :" + numberOfWins);
				return callback(numberOfWins);
			});
	console.log('closes connection');
	connection.end();
}

//UPDATE NUMBER OF WINS FOR A RECENT WINNER IN DATABASE
function updateWins(numberOfWins, winner) {
	var connection = mysql.createConnection({
		host : 'mysql.cs.iastate.edu',
		user : 'dbu309la07',
		password : '5rqZthHkdvd',
		database : 'db309la07'
	});
	connection.connect();
	console.log("makes it here");
	console.log("numberOfWins being entered: " + numberOfWins);
	console.log("winner being entered: "+ winner);
	var wininfo = [numberOfWins, winner]
	connection
			.query(
					"UPDATE User_Info SET WINS = ? WHERE username = ?", wininfo, function(err, result) {
						console.log("added result");
					});
	console.log("end connection");
	connection.end();
}


function startGame(gameID, user, gameConfig, catImage, weaponImage, itemImage, socket){
	/* console.log("inside startGame.");
	 * console.log("socket: ",  socket); 
	 * console.log("gameID: ", gameID); 
	 * console.log("user: ",  user); 
	 * console.log("gameConfig: ", gameConfig);
	 * console.log("catImage: ", catImage);
	 * console.log("weaponImage: ", weaponImage);
	 */
	numPlayer++;
	var player = Player.player(socket.id, numPlayer, user, catImage, weaponImage);
	
	var room = Room.room(gameConfig);
    room.roomPlayers.push(player);

	createItem();
	createObstacles();
	
	var countDown = false;
	var roomID = "game-"+gameID;
	var previousNumOfPlayers;
	
	var gameMode = room.gameMode;
	var gameModeVal = room.gameModeVal;
	
	var time = gameModeVal * 60000;
	var startTime = new Date().getTime();
	var previousTime = startTime;
	
	var intervalId = setInterval(function() {
		var clients = io.sockets.adapter.rooms["game-"+gameID];
		if(pause == false && clients){
			//WAITS FOR ALL PLAYERS TO CONNECT
			if(!countDown){ //Starts countdown
				var currentNumOfPlayers = Object.keys(clients.sockets).length;
				if(currentNumOfPlayers == room.numOfPlayers) {
					countDown = true;
					deleteRoom(gameID);
					room.isActive = true;
			    	var roomId = gameID;
			    	var roomObject = JSON.stringify(room);
			    	console.log("roomObject", roomObject);
			    	addRoom(roomId, roomObject);
			    	io.to("joinRoom").emit("roomDeletedFromDatabase");
					startTime = new Date().getTime();
					previousTime = startTime;
				}
				else if(currentNumOfPlayers != previousNumOfPlayers) { //Diplays waiting screen
					console.log("Inside Waiting on");
					var waitingOn = room.numOfPlayers - currentNumOfPlayers;
					io.to(roomID).emit('waiting', waitingOn);
				}
				previousNumOfPlayers = currentNumOfPlayers;
			} 
			//STARTS GAME
			else {
				//GAMEMODE 1: Stock
				if(gameMode == 1) {
					//Checks how many players are alive
					var numPlayersAlive = room.numOfPlayers;
					Object.keys(clients.sockets).forEach( function(socketId){
						if(Player.PLAYER_LIST[socketId] && Player.PLAYER_LIST[socketId].dead){
							numPlayersAlive--;
						}
					});
					
					//If more than 1 player is alive then continue emitting data to game.html
					if(numPlayersAlive > 1){
						var pack = {
							player: Player.updatePlayer(clients),
							projectile: Player.update(clients),
							obstacles: Obstacles.update(),
							items: Items.update()
						};
						io.to(roomID).emit('newPositions', pack);
					}
					//Else check for the winner and clear the interval
					else {
						var winner;
						Object.keys(clients.sockets).forEach(function(socketId){
							if (!Player.PLAYER_LIST[socketId].dead){
								winner = Player.PLAYER_LIST[socketId].username;
								var sendWinner = {winner: winner};	
								io.to(roomID).emit('endGame', sendWinner, gameID);
								clearInterval(intervalId);
							}	
						});
						getWins(winner, function(numberOfWins){
							var numberOfWins = numberOfWins + 1;
							updateWins(numberOfWins, winner);
						});
					}
				}
				//GAMEMODE 2: Time
				else if(gameMode == 2) {
					var currentTime = new Date().getTime();
					var	gameTime = currentTime - startTime;
					//Checks how many players are alive
					var numPlayersAlive = room.numOfPlayers;
					Object.keys(clients.sockets).forEach( function(socketId){
						if(Player.PLAYER_LIST[socketId] && Player.PLAYER_LIST[socketId].dead){
							numPlayersAlive--;
						}
					});
					
					//If more than 1 player is alive then continue emitting data to game.html
					var numPlayersAlive = room.numOfPlayers;
					Object.keys(clients.sockets).forEach( function(socketId){
						if(Player.PLAYER_LIST[socketId] && Player.PLAYER_LIST[socketId].dead){
							numPlayersAlive--;
						}
					});
					
					if(numPlayersAlive <= 1 || gameTime > time){
						var winner;
						Object.keys(clients.sockets).forEach(function(socketId, callback){
							if (!Player.PLAYER_LIST[socketId].dead)
								winner = Player.PLAYER_LIST[socketId].username;
						});
						var sendWinner = {winner: winner};	
						if(numPlayersAlive > 1)
						io.to(roomID).emit('endGame', sendWinner, gameID);
						clearInterval(intervalId);
					}
					if(currentTime - previousTime > 1000) {
						previousTime = currentTime;
						socket.emit('updateGameTime', Math.floor(gameTime/1000));
					}
					var pack = {
						player: Player.updatePlayer(clients),
						projectile: Player.update(clients),
						obstacles: Obstacles.update(),
						items: Items.update(),
					};
					io.to(roomID).emit('newPositions', pack);
				}
			}
		}
		
	}, 1000 / 25);
	
	socket.on('keyPress', function(data) {
		if (data.inputId === 'left') player.pressingLeft = data.state;
		else if (data.inputId === 'right') player.pressingRight = data.state;
		else if (data.inputId === 'up') player.pressingUp = data.state;
		else if (data.inputId === 'down') player.pressingDown = data.state;
		else if (data.inputId === 'attack') player.generateProjectile = data.state;
		else if (data.inputId === 'mouseAngle') player.mouseAngle = data.state;
		else if (data.inputId === 'pause'){
			//button toggle
			if((pause == true) &&(data.state == true)){
				pause = false;
			}
			else if((pause == false) && (data.state == true)){
				pause = true;
			}
		}
	});
	
	function createItem(){
		var item = Items.items(1,itemImage,500,350);
	}
	
	function createObstacles(){
		var obstacle = Obstacles.obstacles(0);
		obstacle.x = 200;
		obstacle.y = 170;
		obstacle.width = 30;
		obstacle.height = 100;
		
		var obstacle2 = Obstacles.obstacles(1);
		obstacle2.x = 200;
		obstacle2.y = 170;
		obstacle2.width = 100;
		obstacle2.height = 30;
		
		var obstacle3 = Obstacles.obstacles(2);
		obstacle3.x = 800;
		obstacle3.y = 170;
		obstacle3.width = 30;
		obstacle3.height = 100;
		
		var obstacle4 = Obstacles.obstacles(3);
		obstacle4.x = 730;
		obstacle4.y = 170;
		obstacle4.width = 100;
		obstacle4.height = 30;
		
		var obstacle5 = Obstacles.obstacles(4);
		obstacle5.x = 200;
		obstacle5.y = 430;
		obstacle5.width = 30;
		obstacle5.height = 100;
		
		var obstacle6 = Obstacles.obstacles(5);
		obstacle6.x = 200;
		obstacle6.y = 500;
		obstacle6.width = 100;
		obstacle6.height = 30;
		
		var obstacle7 = Obstacles.obstacles(6);
		obstacle7.x = 800;
		obstacle7.y = 430;
		obstacle7.width = 30;
		obstacle7.height = 100;
		
		var obstacle8 = Obstacles.obstacles(7);
		obstacle8.x = 730;
		obstacle8.y = 500;
		obstacle8.width = 100;
		obstacle8.height = 30;
	}
}