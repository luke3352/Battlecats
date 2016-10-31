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


var io = require('socket.io')(serv);
io.sockets.on('connection', function(socket) {
	var id = Math.floor(Math.random() * 999999999);
	SOCKET_LIST[id] = socket;
//	console.log(socket);
	var user, player;
	
	socket.on('disconnect', function() {
		delete SOCKET_LIST[socket.id];
		if(Player.PLAYER_LIST[socket.id]) delete Player.PLAYER_LIST[socket.id];
		if(ROOMS_LIST[socket.id]) delete ROOMS_LIST[socket.id];
	});
	
	// CREATES DIFFERENT USERS
	socket.on('createUser', function(data){
		user = User.user(socket.id, data);
		console.log(user);
		User.USER_LIST[socket.id] = user;
	});
	socket.on('createPlayer', function(data){
		player = Player.player(socket.id);
		Player.PLAYER_LIST[socket.id] = player;
	});
	
	// HANDLES JOINROOM MESSAGES
    socket.on('sendJoinRoomMsgToServer',function(data){
        var playerName = User.USER_LIST[socket.id];
        console.log("Server Recieved Message");
        io.to('JoinRoom').emit('addToJoinRoomChat', playerName + ': ' + data);
        
    });	 
    
	// JOINING ROOMS
	socket.on('joinRoom', function(data){
		console.log("joining room: ", data);
		socket.join(data);
	//	console.log(socket);
	});
	socket.on('leaveRoom', function(data){
		console.log("leaving room: ", data);
		socket.leave(data);
	});
    
    // HANDLES INGAME INPUT
	socket.on('keyPress', function(data) {
		if(player){
			if (data.inputId === 'left') player.pressingLeft = data.state;
			else if (data.inputId === 'right') player.pressingRight = data.state;
			else if (data.inputId === 'up') player.pressingUp = data.state;
			else if (data.inputId === 'down') player.pressingDown = data.state;
			else if (data.inputId === 'attack') player.generateProjectile = data.state;
			else if (data.inputId === 'mouseAngle') player.mouseAngle = data.state;
		}
	});
	

	// CREATES ROOMS
	socket.on('sendCreateRoomData',function(data){
		console.log("retrieving room data", room);
        var room = Room.room(socket.id, data);
        room.roomPlayers.push(Player.PLAYER_LIST[socket.id]);
		ROOMS_LIST[socket.id] = room;
		console.log("updating rooms list");
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('updateRoomsList', ROOMS_LIST);
        }
    });	
	socket.on('requestSocketId', function(data){
		SOCKET_LIST[socket.id].emit('currentSocketId', socket.id);
	});
	socket.on('requestRoomsList',function(data){
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('updateRoomsList', ROOMS_LIST);
        }	
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