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

var SOCKET_LIST = {};
var ROOMS_LIST = {};
var pause = false;

serv.listen(2000);
console.log("Server started.");
//var room = Room.room(1);

// DATABASE FUNCTIONS FOR LOGIN
var verifypassword = verifypassword;
var check_account = check_account;
var add_account = add_account; 

var startGame = startGame;

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
//	console.log(num, " CONNECTION ID: ", socket.id);
//	var id = Math.floor(Math.random() * 999999999);
//	socket.user = User.user(id);
//	SOCKET_LIST[id] = socket;
//	var user, player;
//	

	//socket.id = Math.random();
	var id = socket.id;
	SOCKET_LIST[socket.id] = socket;

	
	//Player.PLAYER_LIST[socket.id] = player;

	socket.on('disconnect', function() {
		console.log("DISCONNECT");
		if(SOCKET_LIST[id]) delete SOCKET_LIST[id];
		if(Player.PLAYER_LIST[id]) delete Player.PLAYER_LIST[id];
		if(ROOMS_LIST[id]) delete ROOMS_LIST[id];
	});
	
	///////////////////////////
	// USER CREATION SOCKETS //
	///////////////////////////
	socket.on('updateUser', function(data){
		socket.setSocketUsername(data);
	});
	socket.on('createPlayer', function(data){
		player = Player.player(id);
		Player.PLAYER_LIST[id] = player;
	});
    
	///////////////////////////
	// GENERIC JOINING ROOMS //
	///////////////////////////
	socket.on('joinRoom', function(data){
		console.log("joining room: ", data);
		socket.join(data);
	});
	socket.on('leaveRoom', function(data){
		console.log("leaving room: ", data);
		socket.leave(data);
	});
	
	///////////////////////////////////////////////////
	///////////////////////////////////////////////////
	///////////// DATABASE AND ROOMSLIST //////////////
	///////////////////////////////////////////////////
	///////////////////////////////////////////////////
    socket.on('getRoomsListFromDatabase', function(){
    	
    });
    socket.on('updateRoomsListInDatabase', function(){
    	
    });
    socket.on('getRoomObjectFromDatabase', function(){
    	
    });
    ///////////////////////////////////////////////////
	///////////////////////////////////////////////////
	///////////////////////////////////////////////////    	
    
    ////////////////
    // START GAME //
    ////////////////
    socket.on('startGame', function(id, user, gameConfig){
    	//socket.emit('joinRoom', id);
    	startGame(id, user, socket, gameConfig);
    });

	///////////////////////
	// HOST ROOM SOCKETS //
	///////////////////////
	socket.on('sendCreateRoomData',function(data){
		//console.log("retrieving room data", room);
		/////////////////////////////
		//ADD ROOM DATA TO DATABASE//
		/////////////////////////////
        //var room = Room.room(data);
        //room.roomPlayers.push(Player.PLAYER_LIST[id]);
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
		///////////////////////////////////
		//RETRIEVE ROOMLIST FROM DATABASE//
		///////////////////////////////////
		io.to('JoinRoom').emit('addToJoinRoomChat', user + ': has connected.');
	});
	socket.on('requestRoomsList',function(){
        io.to('JoinRoom')
        	.emit('updateRoomsList', filterRooms(io.sockets.adapter.rooms));
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
	
	socket.on('sendNewAccountData', function(data){
		var username = data.newusername;
		var password = data.newpassword;
		check_account(username, password, function(value){
			verifycreateAccount(value, username, password);
		});
	})
	
	function verifycreateAccount(value, username, password){
		var value = value; 
		if (value === 1){
			add_account(username, password);
		}
		var verifynewaccount = {value: value};
		socket.emit('verifynewaccount', verifynewaccount);
		console.log("verifycreateAccount socket emmited");
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
					console.log('correct password set');
					correct = 1; 
				}
				else{
					console.log(false);
					correct = 2;
				}
			}
			console.log('return callback');
			return callback(correct);
		}
	});
	console.log('end the connection')
	connection.end();
}
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
				//addingAccount(username, password, connection);
				value = 1; 
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


function startGame(gameID, user, socket, gameConfig){
	var player = Player.player(user);
	var room = Room.room(gameConfig);
    room.roomPlayers.push(player);
    socket.join(gameID);
	function createObstacles(){
		var obstacle = Obstacles.obstacles(0);
		obstacle.x = 300;
		obstacle.y = 300;
	}
		
	createObstacles();
		
	setInterval(function() {
		Room.updateRoom();
		if(pause == false){
			var pack = {
				player: Player.updatePlayer(),
				projectile: Player.update(),
				obstacles: Obstacles.update(),
			}
		}
		else var pack = {};
		
        io.to(gameID).emit('newPositions', pack);
        
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