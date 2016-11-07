var exports = module.exports = {};
var Player = require("./player.js");


var exports = module.exports = {};
var room = null;
exports.ROOMS_LIST = {};
//Handles room settings
exports.room = function(id, data) {
	var self = {
		id: id,
//		roomName: data.gameName, 
//		isPublic: data.publicBoolean, // Public or private
//		password: data.password,
//		numOfPlayers: data.numPlayers, // Default selection
		roomPlayers: [], // Players have different options
//		gameMode: data.gameMode, // default game mode is stock
//		gameModeVal: data.gameModeValue, // either stock or time
//		items: data.items, // items disabled for now
//	};
		numOfPlayers: 4, // Default selection
		pressingStart: false, // Other buttons like this
		isPublic: false, // Public or private
		roomName: "", 
		password: "",
		gameMode: 1, // default game mode is stock
		gameModeVal: 3, // either stock or time
		items: false, // items disabled for now
		numPlayersAlive: 4
	};
	
	self.checkLiving = function(){
		for(var i in Player.PLAYER_LIST){
			//console.log("List"+Player.PLAYER_LIST[i].id);
		}
	}
	room = self;
	return self;
}


exports.updateRoom = function(){
	
		room.checkLiving();
}