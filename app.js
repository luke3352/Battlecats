//app.js
var express = require('express');
var app = express();
var path = require('path');
var serv = require('http').Server(app);
var mysql = require("mysql");

// All HTML files
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/client/index.html'));
});
app.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname + '/client/login/login.html'));
});
app.get('/createaccount', function(req, res){
	res.sendFile(path.join(__dirname + '/client/createaccount/createaccount.html'));
});
app.get('/mainMenu', function(req, res) {
	res.sendFile(path.join(__dirname + '/client/main-menu/mainMenu.html'));
});
app.get('/createRoom', function(req, res) {
	res.sendFile(path.join(__dirname + '/client/create-room/createRoom.html'));
});
app.get('/joinRoom', function(req, res) {
	res.sendFile(path.join(__dirname + '/client/join-room/joinRoom.html'));
});
app.get('/characterSelect', function(req, res) {
	res.sendFile(path.join(__dirname + '/client/character-select/characterSelect.html'));
});
app.get('/weaponSelect', function(req, res) {
	res.sendFile(path.join(__dirname + '/client/weapon-select/weaponSelect.html'));
});
app.get('/game', function(req, res) {
	res.sendFile(path.join(__dirname + '/client/game/game.html'));
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

var verifypassword = function(username, password){
	var correctpassword = true;
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
		});
	connection.connect(function(error){
		if (!!error){
			console.log('Error');
		}
		else{
			console.log('Connected');
		}
		
	connection.query("SELECT _password from User_Info WHERE username ="+ "'" + username+ "'" +";", function(err, rows, fields) {
			if (!err){
				var string = JSON.stringify(rows);
				var json = JSON.parse(string);
				var correctpassword = json[0]._password;
				console.log("entered password: " + password);
				console.log("correct password: " + correctpassword)
				if (password === correctpassword){
					console.log(true);
					correctpassword = true;
				}
				else{
					console.log(false);
					correctpassword = false;
				}
			}
			else{
			  console.log('Error while performing Query.');
			}
		});
		connection.end();
	});
	return correctpassword;
	};

/*
 * List of sockets
 */
var SOCKET_LIST = {};
/*
 * List of in game players
 */
var PLAYER_LIST = {};
//TODO
/* 
 * Should include socket ID and Username
 */
var USER_LIST = {};
/*
 * Should include private and public rooms that players can join
 */
var ROOMS_LIST = {};
/*
 * List of characters
 */
var CHARACTER_LIST = {};
/*
 * List of weapons
 */
var WEAPON_LIST = {};

/*
 * Parent of host, players, etc
 */
var User = function(id, name) {
	var self = {
		username: name,
		id: id,
		type: "", // Admin? Regular? Developer?
		ingame: false,
		game: {},
		
	}
	//TODO Handle input
	return self;
}

/*
 * Creates room
 * Handles host input
 */
var Host = function(id) {
	var self = {
		room: new Room(id), //Room Creation?
		pressingStart: false,
	}
	//TODO Handle input
	return self;
}

/*
 * Handles room settings
 */
var Room = function(id) {
	var self = {
		roomHost: {}, //Host has different options
		roomPlayers: [], //Players have different options
		numOfPlayers: 4, //Default selection
		pressingStart: false, //Other buttons like this
		isPublic: false, //Public or private
		roomName: "", 
		password: "",
		gameMode: 1, //default game mode is stock 
		gameModeVal: 3, // either stock or time
		items: false, //items disabled for now
	};
	//TODO Room options
	return self;
}

/*
 * In game players
 */
var Player = function(id) {
	var self = {
		position : {
			x : 250,
			y : 250,
		},
		width : 30,
		height : 30,
		weapon : {},
		character : {},
		id : id,
		number : "" + Math.floor(10 * Math.random()),
		pressingRight : false,
		pressingLeft : false,
		pressingUp : false,
		pressingDown : false,
		attack : false,
		maxSpd : 2,
	}
	//Check if players share the same position
	self.updatePosition = function() {
		for ( var i in PLAYER_LIST) {
			//check for collision
			if(collision(self, PLAYER_LIST[i])) {
				
			}
			if (self.pressingRight) {
				self.position.x += self.maxSpd;
			}
			if (self.pressingLeft) {
				self.position.x -= self.maxSpd;
			}
			if (self.pressingUp) {
				self.position.y -= self.maxSpd;
			}
			if (self.pressingDown) {
				self.position.y += self.maxSpd;
			}
		}
		function collision(self, enemy) {
			
		}
		
	}
	//TODO Handle Input
	return self;
}
/*
 * In game weapon
 */
var Weapon = function() {
	var self = {
		attack : 0,
		defense : 0,
		length : 0,
		width : 0,
		crit : 0,
		speed : 0,
	}
	//TODO Weapon interactions
	return self;
}

//
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;

	socket.on('disconnect', function() {
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});

	socket.on('keyPress', function(data) {
		if (data.inputId === 'left') player.pressingLeft = data.state;
		else if (data.inputId === 'right') player.pressingRight = data.state;
		else if (data.inputId === 'up') player.pressingUp = data.state;
		else if (data.inputId === 'down') player.pressingDown = data.state;
	});
	//creates room
	socket.on('sendCreateRoomData',function(data){
        var room = Room(1);
		
		room.roomName = data[0];
		room.isPublic = data[1];
		room.password = data[2];
		room.numOfPlayers = data[3];
		room.gameMode = data[4];
		room.gameModeVal = data[5];
		room.items = data[6];
    });	
	socket.on('sendLoginData',function(data){
		 var username = data.username;
	     var password = data.password;
	     var correctpassword = verifypassword(username, password);
	     sendCorrectPassword(correctpassword);
    });	
	
	function sendCorrectPassword(correctpassword) {
		var correctpassword = correctpassword;
		var sendpasswordverification = {correctpassword: correctpassword};
		socket.emit('sendpasswordverification', sendpasswordverification)
	}
	
	
	// HANDLES MESSAGES
    socket.on('sendMsgToServer',function(data){
        var playerName = ("" + socket.id).slice(2,7);
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
        }
    });	 
	
});

setInterval(function() {
	var pack = [];
	for ( var i in PLAYER_LIST) {
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			x : player.position.x,
			y : player.position.y,
			width : player.width,
			height : player.height,
			number : player.number
		});
	}
	for ( var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		//TODO
		// IN GAME SOCKETS
		socket.emit('newPositions', pack);
		
		// PLAYER ROOM SOCKETS
	}
}, 1000 / 25);