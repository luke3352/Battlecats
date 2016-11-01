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

app.use('/client', express.static(__dirname + '/client'));

var User = 	require("./controllers/user.js");
var Room = require("./controllers/room.js");
var Player = require("./controllers/player.js");
var Entity = require("./controllers/entity.js");
var Weapon = require("./controllers/weapon.js");
var Projectile = require("./controllers/projectile.js");

var SOCKET_LIST = {};
var ROOMS_LIST = {};

serv.listen(2000);
console.log("Server started.");


var verifypassword = function(username, password, callback){
	var connection = mysql.createConnection({
		  host     : 'mysql.cs.iastate.edu',
		  user     : 'dbu309la07',
		  password : '5rqZthHkdvd',
		  database : 'db309la07'
	});

	connection.connect();
	connection.query("SELECT _password from User_Info WHERE username ="+ "'" + username+ "'" +";", function(err, rows, fields) {
		if (!err){
			var string = JSON.stringify(rows);
			var json = JSON.parse(string);
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
					correct = 1; 
				}
				else{
					console.log(false);
					correct = 2;
				}
			}
			return callback(correct);
		}
	});
	connection.end();
}

var numOfClient = 0;
var user;
var io = require('socket.io')(serv);
io.sockets.on('connection', function(socket) {
	var num = numOfClient++;
//	console.log(num, " SOCKET: ", socket);
	console.log(num, " CONNECTION ID: ", socket.id);
	var id = Math.floor(Math.random() * 999999999);
	socket.user = User.user(id);
	SOCKET_LIST[id] = socket;
	var user, player;
	
	socket.getSocketUser = function(){
		console.log(num, " GET SOCKET USER ID: ", socket.id);
		console.log("GET SOCKET USER: ", socket.user);
		return socket.user;
	}
	socket.setSocketUsername = function(name){
		console.log(num, " SET SOCKET USERNAME ID: ", socket.id);
		console.log("SET SOCKET USERNAME: ");
		console.log("BEFORE: ", socket.user);
		socket.user.username = name;
		console.log("AFTER: ", socket.user);
		socket.getSocketUser();
	}
	
	socket.on('disconnect', function() {
		console.log("DISCONNECT");
		delete SOCKET_LIST[id];
		if(Player.PLAYER_LIST[id]) delete Player.PLAYER_LIST[id];
		if(ROOMS_LIST[id]) delete ROOMS_LIST[id];
	});
	
	// CREATES DIFFERENT USERS
	socket.on('updateUser', function(data){
		socket.setSocketUsername(data);
	});
	socket.on('createPlayer', function(data){
		player = Player.player(id);
		Player.PLAYER_LIST[id] = player;
	});
	
	// HANDLES JOINROOM MESSAGES
    socket.on('sendJoinRoomMsgToServer',function(msg){
        var name = socket.getSocketUser().username;
        io.to('JoinRoom').emit('addToJoinRoomChat', name + ': ' + msg);
    });	 
    
	// JOINING ROOMS
	socket.on('joinRoom', function(data){
		console.log("joining room: ", data);
		socket.join(data);
	});
	socket.on('leaveRoom', function(data){
		console.log("leaving room: ", data);
		socket.leave(data);
	});
    
    // HANDLES INGAME INPUT
	socket.on('keyPress', function(data) {
		if(player) {
			if (data.inputId === 'left') player.pressingLeft = data.state;
			else if (data.inputId === 'right') player.pressingRight = data.state;
			else if (data.inputId === 'up') player.pressingUp = data.state;
			else if (data.inputId === 'down') player.pressingDown = data.state;
			else if (data.inputId === 'attack') player.generateProjectile = data.state;
			else if (data.inputId === 'mouseAngle') player.mouseAngle = data.state;
		}
	});

	// ROOMS
	socket.on('sendCreateRoomData',function(data){
		console.log("retrieving room data", room);
        var room = Room.room(id, data);
        room.roomPlayers.push(Player.PLAYER_LIST[id]);
        //JOIN HOSTING ROOM ROOM
        socket.join(room.roomName);
        io.sockets.adapter.rooms[room.roomName].room = room;
        io.to('JoinRoom')
        	.emit('updateRoomsList', filterRooms(io.sockets.adapter.rooms));

    });	
	socket.on('requestRoomsList',function(){
		console.log(num, " REQUEST ROOMS ID: ", socket.id);
        io.to('JoinRoom')
        	.emit('updateRoomsList', filterRooms(io.sockets.adapter.rooms));
    });
	socket.on('requestSocketId', function(data){
		SOCKET_LIST[id].emit('currentSocketId', id);
	});
	
	// SOCKET LOGIN
	socket.on('sendLoginData',function(data){
		 var username = data.username;
	     var password = data.password;
	     verifypassword(username, password, function(correct){
	      	 sendCorrectPassword(username, correct);
	    });  
    });	
	
	function sendCorrectPassword(username, correct) {
		console.log(correct);
		var correct = correct;
		var sendpasswordverification = {correct: correct, username: username};
		socket.emit('sendpasswordverification', sendpasswordverification);
	}	 
});

function filterRooms(rooms) {
//	console.log("Rooms: ", rooms);
	var roomsList = {};
	for(var i in rooms){
		if(rooms[i].room){
			roomsList[rooms[i].room.roomName] = rooms[i].room;
		}
	}
	return roomsList;
}

setInterval(function() {
	var pack = {
		player:Player.updatePlayer(),
		projectile:Projectile.update(),
	}
	
	for ( var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack);

	}
}, 1000 / 25);