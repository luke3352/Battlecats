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
app.use('/client', express.static(__dirname + '/client'));

var User = 	require("./controllers/user.js");
var Room = require("./controllers/room.js");
var Player = require("./controllers/player.js");
var Entity = require("./controllers/entity.js");
var Weapon = require("./controllers/weapon.js");
var Projectile = require("./controllers/projectile.js");
var Obstacles = require("./controllers/obstacles.js");

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
    		//console.log("roomsList in the callback" + roomslist);
    	});
    });
    
    function returnRoomsList(roomslist){
    	socket.emit("updateRoomsList", JSON.parse(roomslist));
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
    socket.on('startGame', function(id, user, gameConfig){
    	startGame(id, user, gameConfig, socket);
    });

	///////////////////////
	// HOST ROOM SOCKETS //
	///////////////////////
	socket.on('sendCreateRoomData',function(data, user){
        var room = Room.room(data);
        room.roomPlayers.push(user);        
        io.to('JoinRoom').emit('updateRoomsList', data);
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

function startGame(gameID, user, gameConfig, socket){
	/*console.log("inside startGame.");
	console.log("gameID: ", gameID); 
	console.log("user: ",  user); 
	//console.log("socket: ",  socket); 
	console.log("gameConfig: ", gameConfig);*/
	
	numPlayer++;
	var player = Player.player(socket.id, numPlayer);
	

	var room = Room.room(gameConfig);
    room.roomPlayers.push(player);

	function createObstacles(){
		var obstacle = Obstacles.obstacles(0);
		obstacle.x = 300;
		obstacle.y = 300;
	}
		
	createObstacles();
	var countDown = false;
	var roomID = "game-"+gameID;
	var previousNumOfPlayers;
	var intervalId = setInterval(function() {
		Room.updateRoom();
		if(pause == false){
			var clients = io.sockets.adapter.rooms["game-"+gameID];
			if(clients){
				if(!countDown){ //Starts countdown
					var currentNumOfPlayers = Object.keys(clients.sockets).length;
					if(currentNumOfPlayers == room.numOfPlayers) {
//						console.log("Inside Countdown");
//						function countDownFunc(i, callback) {
//							console.log("inside countDownFunc");
//						    callback = callback || function(){};
//						    var int = setInterval(function() {
//						        io.to(roomID).emit('countdown', i);
//						        i-- || (clearInterval(int), callback());
//						    }, 1000);
//						}
//						countDownFunc(5);
						socket.emit('deleteRoomFromDatabase', gameID);
						countDown = true;
					}
					else if(currentNumOfPlayers != previousNumOfPlayers) { //Diplays waiting screen
						console.log("Inside Waiting on");
						console.log("curr ", currentNumOfPlayers);
						console.log("gameConfig ", room.numOfPlayers);
						var waitingOn = room.numOfPlayers - currentNumOfPlayers;
						io.to(roomID).emit('waiting', waitingOn);
					}
					previousNumOfPlayers = currentNumOfPlayers;
				} else {
					//Check if all but one players are dead
					var numPlayersAlive = room.numOfPlayers;
					Object.keys(clients.sockets).forEach( function(socketId){
						if(Player.PLAYER_LIST[socketId].dead)
							numPlayersAlive--;
					});
					if(numPlayersAlive > 1){
						var pack = {
							player: Player.updatePlayer(clients),
							projectile: Player.update(clients),
							obstacles: Obstacles.update(),
						};
						io.to(roomID).emit('newPositions', pack);
					}
					else {
						io.to(roomID).emit('endGame');
						clearInterval(intervalId);
					}
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
}