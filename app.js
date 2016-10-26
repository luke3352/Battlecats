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


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	var player = Player.player(socket.id);
	Player.PLAYER_LIST[socket.id] = player;

	socket.on('disconnect', function() {
		delete SOCKET_LIST[socket.id];
		delete Player.PLAYER_LIST[socket.id];
	});

	socket.on('keyPress', function(data) {
		if (data.inputId === 'left') player.pressingLeft = data.state;
		else if (data.inputId === 'right') player.pressingRight = data.state;
		else if (data.inputId === 'up') player.pressingUp = data.state;
		else if (data.inputId === 'down') player.pressingDown = data.state;
		else if (data.inputId === 'enter') player.generateProjectile = data.state;
	});
	// creates room
	socket.on('sendCreateRoomData',function(data){
        var room = Room.room(1);
		
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
	     verifypassword(username, password, function(correct){
	      	 sendCorrectPassword(username, correct);
	    });  
    });	
	
	function sendCorrectPassword(username, correct) {
		console.log(correct);
		var correct = correct;
		var sendpasswordverification = {correct: correct, username: username};
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
	var pack = {
		player:Player.updatePlayer(),
		projectile:Projectile.update(),
	}
	
	for ( var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		// TODO
		// IN GAME SOCKETS
		socket.emit('newPositions', pack);
		
		// PLAYER ROOM SOCKETS
	}
}, 1000 / 25);