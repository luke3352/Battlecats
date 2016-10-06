//app.js
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(8080);
console.log("Server started.");
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
		weapon : {},
		character : {},
		id : id,
		number : "" + Math.floor(10 * Math.random()),
		pressingRight : false,
		pressingLeft : false,
		pressingUp : false,
		pressingDown : false,
		attack : false,
		maxSpd : 10,
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
});

setInterval(function() {
	var pack = [];
	for ( var i in PLAYER_LIST) {
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			x : player.position.x,
			y : player.position.y,
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
